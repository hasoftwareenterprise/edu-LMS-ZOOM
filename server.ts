import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import KJUR from "jsrsasign";
import dotenv from "dotenv";
import { PrismaClient, users_role, teacher_approval_status } from "@prisma/client";
import bcrypt from "bcryptjs";
import axios from "axios";
// Google Drive integration removed as per user request

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("[PRISMA] Database connected successfully"))
  .catch(e => console.error("[PRISMA] Database connection failed:", e));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Synchronization Logic ---

// Bootstrap default users (admin, sample teacher, sample student)
async function bootstrapUsers() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@mail.com").trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || "admin@123").trim();

  await prisma.users.deleteMany({ where: { OR: [{ email: adminEmail }, { username: "admin" }] } }).catch(() => {});

  const testUsers = [
    { email: adminEmail, username: "admin", password: adminPassword, role: users_role.ADMIN, fullName: "System Admin", approvalStatus: teacher_approval_status.APPROVED },
    { email: "teacher1@mail.com", username: "teacher1", password: "password123", role: users_role.TEACHER, fullName: "John Teacher", approvalStatus: teacher_approval_status.APPROVED },
    { email: "student1@mail.com", username: "student1", password: "password123", role: users_role.STUDENT, fullName: "Jane Student", approvalStatus: teacher_approval_status.APPROVED },
  ];

  for (const user of testUsers) {
    try {
      console.log(`[BOOTSTRAP] Checking user: ${user.email}`);
      const existing = await prisma.users.findFirst({
        where: { OR: [{ email: user.email }, { username: user.username }] }
      });
      const hashedPassword = await bcrypt.hash(user.password, 10);

      if (!existing) {
        console.log(`[BOOTSTRAP] User ${user.email} not found. Creating...`);
        const newUser = await prisma.users.create({
          data: {
            id: uuidv4(),
            email: user.email,
            username: user.username,
            password: hashedPassword,
            role: user.role,
            approvalStatus: user.approvalStatus,
            fullName: user.fullName,
            isVerified: true,
            updatedAt: new Date(),
          } as any,
        });
        console.log(`[BOOTSTRAP] Successfully created user: ${user.email}`);

        if (user.username === "teacher1") {
          const courseId = uuidv4();
          await prisma.modules.create({
            data: {
              id: courseId,
              name: "A/L Combined Mathematics",
              description: "Advanced Level Combined Mathematics covering Calculus, Algebra, and Statistics.",
              price: 50.0,
              color: "#f3184c",
              type: "COURSE",
              teacherId: newUser.id,
              startDate: new Date(),
              startTime: "10:00",
              endTime: "12:00",
              updatedAt: new Date()
            } as any
          });
          await prisma.live_classes.create({
            data: {
              id: uuidv4(),
              title: "Introduction to Calculus",
              moduleId: courseId,
              scheduledAt: new Date(Date.now() + 3600000),
              duration: 60,
              zoomMeetingId: "1234567890",
              zoomPassword: "zoompassword",
              updatedAt: new Date()
            } as any
          });
        }
      } else {
        console.log(`[BOOTSTRAP] User ${user.email} exists. Updating credentials...`);
        await prisma.users.update({
          where: { id: existing.id },
          data: { 
            password: hashedPassword, 
            role: user.role, 
            approvalStatus: user.approvalStatus,
            fullName: user.fullName 
          } as any
        });
        console.log(`[BOOTSTRAP] Successfully updated user: ${user.email}`);
      }
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`[BOOTSTRAP] Conflict on user ${user.email}, skipping.`);
      } else {
        console.error(`[BOOTSTRAP] Critical error for ${user.email}:`, err);
      }
    }
  }
}

bootstrapUsers().catch(console.error);

app.use(cors());
app.use(express.json());

// Zoom SDK Required Headers for SharedArrayBuffer/WebGL support
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// --- API Routes ---

// Health Check: Validate Environment Variables
app.get("/api/health", (req, res) => {
  const requiredVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "ZOOM_SDK_KEY",
    "ZOOM_SDK_SECRET",
    "ZOOM_ACCOUNT_ID",
    "ZOOM_CLIENT_ID",
    "ZOOM_CLIENT_SECRET"
  ];

  const status: Record<string, string> = {};
  let allPresent = true;

  requiredVars.forEach(v => {
    const present = !!process.env[v];
    status[v] = present ? "PRESENT" : "MISSING";
    if (!present) allPresent = false;
  });

  res.json({
    status: allPresent ? "OK" : "CONFIGURATION_INCOMPLETE",
    environment: status,
    timestamp: new Date().toISOString()
  });
});

// Auth: Signup (Extended for Teacher/Student roles)
app.post("/api/auth/signup", async (req, res) => {
  const {
    email, username, password, role,
    // Common
    fullName, mobileNumber, whatsappNumber, profilePhotoUrl,
    // Teacher-specific
    nicNumber, educationQualifications, instituteName, businessRegNo,
    subjectSpecialization, shortBio,
    zoomSdkKey, zoomSdkSecret, zoomAccountId, zoomClientId, zoomClientSecret,
    googleClientId, googleClientSecret,
    // Student-specific
    school, dateOfBirth, gradeYear
  } = req.body;

  try {
    const signupRole = role === "TEACHER" ? users_role.TEACHER : users_role.STUDENT;
    // Teachers need admin approval; students are auto-approved
    const approvalStatus = signupRole === users_role.TEACHER
      ? teacher_approval_status.PENDING
      : teacher_approval_status.APPROVED;

    const existing = await prisma.users.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      return res.status(400).json({ message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await (prisma.users as any).create({
        data: {
          id: uuidv4(),
          email,
          username,
          password: hashedPassword,
          role: signupRole,
          approvalStatus,
          isVerified: true,
          fullName: fullName || null,
          mobileNumber: mobileNumber || null,
          whatsappNumber: whatsappNumber || null,
          profilePhotoUrl: profilePhotoUrl || null,
          // Teacher fields
          nicNumber: nicNumber || null,
          educationQualifications: educationQualifications || null,
          instituteName: instituteName || null,
          businessRegNo: businessRegNo || null,
          subjectSpecialization: subjectSpecialization || null,
          shortBio: shortBio || null,
          zoomSdkKey: zoomSdkKey || null,
          zoomSdkSecret: zoomSdkSecret || null,
          zoomAccountId: zoomAccountId || null,
          zoomClientId: zoomClientId || null,
          zoomClientSecret: zoomClientSecret || null,
          googleClientId: googleClientId || null,
          googleClientSecret: googleClientSecret || null,
          // Student fields
          school: school || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gradeYear: gradeYear || null,
          updatedAt: new Date(),
        },
      });
    } catch (createError: any) {
      if (createError.code === 'P2002') {
        const target = createError.meta?.target;
        const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');
        if (targetStr.includes('email')) return res.status(400).json({ message: "Email already in use" });
        if (targetStr.includes('username')) return res.status(400).json({ message: "Username already in use" });
        return res.status(400).json({ message: "User already exists" });
      }
      throw createError;
    }

    res.status(201).json({
      message: "Account created successfully",
      requiresApproval: signupRole === users_role.TEACHER
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
});


// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim();
  const password = String(req.body.password || "");
  console.log(`[LOGIN TRACE] Body: ${JSON.stringify(req.body)}`);
  console.log(`[LOGIN TRACE] Attempting login: ${email}, BodyKeys: ${Object.keys(req.body)}`);

  try {
    const allUsers = await prisma.users.findMany();
    console.log(`[LOGIN DEBUG] Total DB Users: ${allUsers.length}, Registered: [${allUsers.map(u => u.email).join(", ")}]`);

    const user = await prisma.users.findFirst({
      where: { OR: [{ email: email }, { username: email }] },
      include: { sessions: true }
    });

    if (!user) {
      console.log(`[LOGIN TRACE] User NOT found for: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isBcryptMatch = await bcrypt.compare(password, user.password).catch(() => false);
    const isPlainMatch = password === user.password;
    const isMatch = isBcryptMatch || isPlainMatch;

    console.log(`[LOGIN TRACE] UserFound: ${user?.email}, Match: ${isMatch}`);
    console.log(`[LOGIN TRACE] User: ${user.email}, Bcrypt: ${isBcryptMatch}, Plain: ${isPlainMatch}, Stored: ${user.password.startsWith('$2') ? 'HASHED' : 'PLAIN'}`);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Concurrent Login Prevention: Delete old sessions for this user
    await prisma.sessions.deleteMany({
      where: { userId: user.id }
    });

    const sessionId = uuidv4();
    const token = jwt.sign(
      { userId: user.id, email: user.email, sessionId, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    console.log(`Creating session for user ${user.email} with ID: ${sessionId}`);

    // Create session in DB
    console.log(`Creating session for user ${user.email} with ID: ${sessionId}, Token: ${token.substring(0, 10)}...`);
    const createdSession = await prisma.sessions.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    console.log(`Session created in DB: ${createdSession.id}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware: Verify Session (Concurrent Login Prevention)
const verifySession = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    if (!decoded.sessionId) {
      console.error("Token missing sessionId");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Check if session exists and is valid
    console.log(`Verifying session ID: ${decoded.sessionId} for user: ${decoded.email}`);
    const session = await prisma.sessions.findUnique({
      where: { id: decoded.sessionId }
    });

    if (!session) {
      console.warn(`Session not found for ID: ${decoded.sessionId}. User: ${decoded.email}`);
      // Log all sessions for this user to debug
      const allSessions = await prisma.sessions.findMany({ where: { userId: decoded.userId } });
      console.warn(`All sessions for user ${decoded.userId}:`, allSessions.map(s => s.id));

      return res.status(403).json({
        code: "KICK_OUT",
        message: "Session not found",
        debug: {
          sessionId: decoded.sessionId,
          userId: decoded.userId,
          existingSessionIds: allSessions.map(s => s.id)
        }
      });
    }

    if (session.expiresAt < new Date()) {
      console.warn(`Session expired for ID: ${decoded.sessionId}. User: ${decoded.email}`);
      return res.status(403).json({
        code: "KICK_OUT",
        message: "Session expired"
      });
    }

    // Optional: Verify token matches (to prevent replay attacks with old tokens for same session)
    if (session.token !== token) {
      console.warn(`Token mismatch for session ID: ${decoded.sessionId}. User: ${decoded.email}`);
      return res.status(403).json({
        code: "KICK_OUT",
        message: "Session invalidated by a newer login"
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Clear all data (for testing)
app.post("/api/clear-data", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) {
    return res.status(403).json({ message: "Only admins can clear data" });
  }

  try {
    // Delete in order to respect foreign key constraints
    await prisma.enrollments.deleteMany({});
    await prisma.live_classes.deleteMany({});
    await prisma.modules.deleteMany({});
    // Keep users but maybe delete non-test users if needed
    // For now just clear courses and classes
    res.json({ message: "Data cleared successfully" });
  } catch (err) {
    console.error("Clear data error:", err);
    res.status(500).json({ message: "Error clearing data" });
  }
});

// Dashboard Data
app.get("/api/dashboard", verifySession, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            modules: true
          }
        },
        modules: true // Modules created by this user (if teacher)
      }
    });

    let upcomingClasses;
    if (role === users_role.TEACHER) {
      // For teachers, show classes for their own modules
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      upcomingClasses = await prisma.live_classes.findMany({
        where: {
          modules: {
            teacherId: userId
          },
          scheduledAt: {
            gte: startOfToday
          }
        },
        include: {
          modules: true
        },
        orderBy: {
          scheduledAt: 'asc'
        }
      });
    } else {
      // For students, show classes for enrolled modules
      const enrolledModuleIds = user?.enrollments.map(e => e.moduleId) || [];
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      upcomingClasses = await prisma.live_classes.findMany({
        where: {
          moduleId: {
            in: enrolledModuleIds
          },
          scheduledAt: {
            gte: startOfToday
          }
        },
        include: {
          modules: true
        },
        orderBy: {
          scheduledAt: 'asc'
        }
      });
    }

    // Calculate some stats
    let totalStudents = 0;
    if (role === users_role.TEACHER) {
      const teacherModulesWithEnrollments = await prisma.modules.findMany({
        where: { teacherId: userId },
        include: { enrollments: true }
      });
      totalStudents = teacherModulesWithEnrollments.reduce((acc, mod) => acc + mod.enrollments.length, 0);
    }

    const stats = {
      totalStudents: role === users_role.TEACHER ? totalStudents : undefined,
      activeCourses: role === users_role.TEACHER ? user?.modules.length : user?.enrollments.length,
      completedTasks: 0,
      upcomingTasks: upcomingClasses.length
    };

    res.json({
      enrolledCourses: user?.enrollments.map(e => e.modules) || [],
      teacherModules: user?.modules || [],
      upcomingClasses: upcomingClasses,
      stats
    });
  } catch (err: any) {
    console.error("Dashboard error:", err);
    if (err.code) console.error("Prisma Error Code:", err.code);
    if (err.meta) console.error("Prisma Error Meta:", err.meta);
    res.status(500).json({ message: "Error fetching dashboard data", error: err.message });
  }
});

// Courses: Create
app.post("/api/courses", verifySession, async (req: any, res) => {
  const { name, description, imageUrl, price, startDate, startTime, endTime, type, color, googleDriveFolderName } = req.body;
  const userId = req.user.userId;

  if (req.user.role !== users_role.TEACHER && req.user.role !== users_role.ADMIN) {
    return res.status(403).json({ message: "Only teachers can create courses" });
  }

  if (price !== undefined && price < 0) {
    return res.status(400).json({ message: "Price cannot be negative" });
  }

  try {
    const course = await prisma.modules.create({
      data: {
        id: uuidv4(),
        name,
        description,
        price: price || 0,
        imageUrl: imageUrl || null,
        color: color || "#f3184c",
        type: type || "COURSE",
        startDate: startDate ? new Date(startDate) : new Date(),
        startTime: startTime || "09:00",
        endTime: endTime || "10:00",
        teacherId: userId,
        updatedAt: new Date()
      } as any
    });
    res.status(201).json(course);
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
});

// Courses: Update
app.put("/api/courses/:id", verifySession, async (req: any, res) => {
  const { id } = req.params;
  const { name, description, imageUrl, price, startDate, startTime, endTime, type, color } = req.body;
  const userId = req.user.userId;

  if (price !== undefined && Number(price) < 0) {
    return res.status(400).json({ message: "Price cannot be negative" });
  }

  try {
    const course = await prisma.modules.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacherId !== userId && req.user.role !== users_role.ADMIN) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await prisma.modules.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        imageUrl: imageUrl || null,
        color: color || "#f3184c",
        type: type || "COURSE",
        startDate: startDate ? new Date(startDate) : undefined,
        startTime,
        endTime,
        updatedAt: new Date()
      } as any
    });
    res.json(updated);
  } catch (error) {
    console.error("Course update error:", error);
    res.status(500).json({ message: "Failed to update course" });
  }
});

// Admin: Clear Data (Fresh Start)
app.post("/api/admin/clear-data", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) {
    return res.status(403).json({ message: "Only admins can clear data" });
  }

  try {
    // Delete in order to respect constraints
    await prisma.recordings.deleteMany({});
    await prisma.live_classes.deleteMany({});
    await prisma.enrollments.deleteMany({});
    await prisma.modules.deleteMany({});
    // Keep users but clear sessions
    await prisma.sessions.deleteMany({});

    res.json({ message: "All data cleared successfully" });
  } catch (error) {
    console.error("Clear data error:", error);
    res.status(500).json({ message: "Failed to clear data" });
  }
});

// Courses: Delete
app.delete("/api/courses/:id", verifySession, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const course = await prisma.modules.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacherId !== userId && req.user.role !== users_role.ADMIN) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.modules.delete({ where: { id } });
    res.json({ message: "Course deleted" });
  } catch (error) {
    console.error("Course deletion error:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

// Live Classes: Create
app.post("/api/live-classes", verifySession, async (req: any, res) => {
  const { title, moduleId, scheduledAt } = req.body;

  if (req.user.role !== users_role.TEACHER && req.user.role !== users_role.ADMIN) {
    return res.status(403).json({ message: "Only teachers can schedule classes" });
  }

  try {
    // 1. Get Zoom Access Token via Server-to-Server OAuth
    const authHeader = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    // 2. Create Zoom Meeting
    const meetingResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: title,
        type: 2, // Scheduled meeting
        start_time: new Date(scheduledAt).toISOString(),
        duration: 60,
        timezone: 'UTC',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 2,
          audio: 'both',
          auto_recording: 'none'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedMeetingId = meetingResponse.data.id.toString();
    const generatedPassword = meetingResponse.data.password;

    const liveClass = await prisma.live_classes.create({
      data: {
        id: uuidv4(),
        title,
        moduleId,
        scheduledAt: new Date(scheduledAt),
        duration: 60,
        zoomMeetingId: generatedMeetingId,
        zoomPassword: generatedPassword,
        updatedAt: new Date()
      } as any
    });
    res.status(201).json(liveClass);
  } catch (error: any) {
    console.error("Live class creation error:", error.response?.data || error);
    res.status(500).json({ message: "Failed to schedule class with Zoom" });
  }
});

// Update a live class
app.put("/api/live-classes/:id", verifySession, async (req: any, res) => {
  const { id } = req.params;
  const { title, scheduledAt } = req.body;

  if (req.user.role !== users_role.TEACHER && req.user.role !== users_role.ADMIN) {
    return res.status(403).json({ message: "Only teachers can update classes" });
  }

  try {
    const liveClass = await prisma.live_classes.update({
      where: { id },
      data: {
        title,
        scheduledAt: new Date(scheduledAt),
        updatedAt: new Date()
      } as any
    });
    res.json(liveClass);
  } catch (error) {
    console.error("Failed to update live class", error);
    res.status(500).json({ message: "Failed to update live class" });
  }
});

// Delete a live class
app.delete("/api/live-classes/:id", verifySession, async (req: any, res) => {
  const { id } = req.params;

  if (req.user.role !== users_role.TEACHER && req.user.role !== users_role.ADMIN) {
    return res.status(403).json({ message: "Only teachers can delete classes" });
  }

  try {
    await prisma.live_classes.delete({
      where: { id }
    });
    res.json({ message: "Live class deleted successfully" });
  } catch (error) {
    console.error("Failed to delete live class", error);
    res.status(500).json({ message: "Failed to delete live class" });
  }
});

// Zoom: Generate Signature
app.post("/api/zoom/signature", verifySession, (req, res) => {
  const { meetingNumber, role } = req.body;

  if (!meetingNumber) {
    return res.status(400).json({ message: "Meeting number is required" });
  }

  // Clean meeting number (remove spaces)
  const cleanMeetingNumber = meetingNumber.toString().replace(/\s/g, '');

  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const oHeader = { alg: "HS256", typ: "JWT" };
  const oPayload = {
    sdkKey: process.env.ZOOM_SDK_KEY,
    mn: cleanMeetingNumber,
    role: role,
    iat: iat,
    exp: exp,
    appKey: process.env.ZOOM_SDK_KEY,
    tokenExp: iat + 60 * 60 * 2,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const signature = KJUR.jws.JWS.sign(
    "HS256",
    sHeader,
    sPayload,
    process.env.ZOOM_SDK_SECRET || ""
  );

  res.json({
    signature,
    sdkKey: process.env.ZOOM_SDK_KEY
  });
});

// --- Admin APIs ---

// Admin: Full statistics
app.get("/api/admin/stats", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    const [totalStudents, approvedTeachers, pendingTeachers, activeModules, totalEnrollments] = await Promise.all([
      (prisma.users as any).count({ where: { role: users_role.STUDENT, isActive: true } }),
      (prisma.users as any).count({ where: { role: users_role.TEACHER, approvalStatus: "APPROVED" } }),
      (prisma.users as any).count({ where: { role: users_role.TEACHER, approvalStatus: "PENDING" } }),
      prisma.modules.count({ where: { isActive: true } }),
      prisma.enrollments.count({ where: { status: "PAID" } }),
    ]);
    const revenueData = await prisma.enrollments.findMany({ where: { status: "PAID" }, select: { amount: true } });
    const totalRevenue = revenueData.reduce((sum, e) => sum + Number(e.amount), 0);
    res.json({ totalStudents, approvedTeachers, pendingTeachers, activeModules, totalEnrollments, totalRevenue });
  } catch (err) { console.error("Admin stats error:", err); res.status(500).json({ message: "Error fetching stats" }); }
});

// Admin: Get all teachers
app.get("/api/admin/teachers", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    const teachers = await (prisma.users as any).findMany({
      where: { role: users_role.TEACHER },
      select: {
        id: true, email: true, username: true, fullName: true, mobileNumber: true,
        approvalStatus: true, isActive: true, createdAt: true, instituteName: true,
        subjectSpecialization: true, profilePhotoUrl: true, nicNumber: true,
        educationQualifications: true, shortBio: true,
        modules: { select: { id: true, name: true, price: true, enrollments: { select: { amount: true, status: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(teachers);
  } catch (err) { console.error("Admin teachers error:", err); res.status(500).json({ message: "Error fetching teachers" }); }
});

// Admin: Approve teacher
app.put("/api/admin/teachers/:id/approve", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    await (prisma.users as any).update({ where: { id: req.params.id }, data: { approvalStatus: "APPROVED" } });
    res.json({ message: "Teacher approved" });
  } catch (err) { res.status(500).json({ message: "Error approving teacher" }); }
});

// Admin: Suspend teacher
app.put("/api/admin/teachers/:id/suspend", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    await (prisma.users as any).update({ where: { id: req.params.id }, data: { approvalStatus: "SUSPENDED" } });
    res.json({ message: "Teacher suspended" });
  } catch (err) { res.status(500).json({ message: "Error suspending teacher" }); }
});

// Admin: Get all students
app.get("/api/admin/students", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    const students = await (prisma.users as any).findMany({
      where: { role: users_role.STUDENT },
      select: {
        id: true, email: true, username: true, fullName: true, mobileNumber: true,
        isActive: true, createdAt: true, school: true, gradeYear: true, profilePhotoUrl: true,
        enrollments: { select: { id: true, status: true, amount: true, modules: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(students);
  } catch (err) { console.error("Admin students error:", err); res.status(500).json({ message: "Error fetching students" }); }
});

// Admin: Toggle user active status
app.put("/api/admin/users/:id/toggle", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    const user = await prisma.users.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    await prisma.users.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
    res.json({ message: "User status updated", isActive: !user.isActive });
  } catch (err) { res.status(500).json({ message: "Error toggling user" }); }
});

// Admin: Delete user
app.delete("/api/admin/users/:id", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    await prisma.users.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ message: "Error deleting user" }); }
});

// Admin: Get all courses (with teacher and enrollment info)
app.get("/api/admin/courses", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    const courses = await prisma.modules.findMany({
      include: {
        users: { select: { id: true, fullName: true, email: true, username: true } as any },
        enrollments: { select: { id: true, status: true, amount: true } },
        live_classes: { select: { id: true, title: true, scheduledAt: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: "Error fetching courses" }); }
});

// Admin: Get purchase logs
app.get("/api/admin/purchases", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.ADMIN) return res.status(403).json({ message: "Forbidden" });
  try {
    const purchases = await prisma.enrollments.findMany({
      where: { status: "PAID" },
      include: {
        users: { select: { id: true, email: true, fullName: true, username: true } as any },
        modules: {
          select: { id: true, name: true, price: true,
            users: { select: { id: true, fullName: true, email: true } as any }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(purchases);
  } catch (err) { res.status(500).json({ message: "Error fetching purchases" }); }
});

// --- Student APIs ---

// Student: Browse available (active) courses
app.get("/api/courses/available", verifySession, async (req: any, res) => {
  try {
    const courses = await prisma.modules.findMany({
      where: { isActive: true },
      include: {
        users: { select: { id: true, fullName: true, username: true, profilePhotoUrl: true } as any },
        enrollments: { select: { id: true, status: true, userId: true } },
        live_classes: { select: { id: true, scheduledAt: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: "Error fetching courses" }); }
});

// Student: Enroll in course (dummy payment - always succeeds)
app.post("/api/enrollments", verifySession, async (req: any, res) => {
  const { moduleId } = req.body;
  const userId = req.user.userId;
  try {
    const course = await prisma.modules.findUnique({ where: { id: moduleId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await prisma.enrollments.findUnique({ where: { userId_moduleId: { userId, moduleId } } });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = await prisma.enrollments.create({
      data: {
        id: uuidv4(),
        userId,
        moduleId,
        status: "PAID",
        amount: course.price,
        paidAt: new Date(),
        updatedAt: new Date()
      } as any
    });
    res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (err) { console.error("Enrollment error:", err); res.status(500).json({ message: "Enrollment failed" }); }
});

// Student: Get enrolled courses with meetings
app.get("/api/student/my-courses", verifySession, async (req: any, res) => {
  const userId = req.user.userId;
  try {
    const enrollments = await prisma.enrollments.findMany({
      where: { userId, status: "PAID" },
      include: {
        modules: {
          include: {
            users: { select: { id: true, fullName: true, username: true } as any },
            live_classes: { orderBy: { scheduledAt: 'asc' } }
          }
        }
      }
    });
    res.json(enrollments.map(e => e.modules));
  } catch (err) { res.status(500).json({ message: "Error fetching courses" }); }
});

// --- Teacher APIs ---

// Student: Get available modules (not enrolled)
app.get("/api/student/available-modules", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.STUDENT) return res.status(403).json({ message: "Forbidden" });
  try {
    const enrolledIds = (await prisma.enrollments.findMany({
      where: { userId: req.user.userId },
      select: { moduleId: true }
    })).map(e => e.moduleId);

    const modules = await prisma.modules.findMany({
      where: { 
        isActive: true,
        ...(enrolledIds.length > 0 ? { id: { notIn: enrolledIds } } : {})
      },
      include: {
        users: {
          select: { fullName: true, profilePhotoUrl: true, subjectSpecialization: true }
        }
      }
    });
    res.json(modules);
  } catch (err) { res.status(500).json({ message: "Error fetching available hubs" }); }
});

// Student: Enroll in a module (Mock Payment)
app.post("/api/student/enroll", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.STUDENT) return res.status(403).json({ message: "Forbidden" });
  const { moduleId } = req.body;
  try {
    const module = await prisma.modules.findUnique({ where: { id: moduleId } });
    if (!module) return res.status(404).json({ message: "Hub not found" });

    const enrollment = await prisma.enrollments.create({
      data: {
        id: uuidv4(),
        userId: req.user.userId,
        moduleId: moduleId,
        status: "PAID",
        paidAt: new Date(),
        amount: module.price,
        updatedAt: new Date()
      }
    });

    res.json({ message: "Enrolled successfully", enrollment });
  } catch (err) { res.status(500).json({ message: "Enrollment failed" }); }
});

// Teacher: Get all students from teacher's courses
app.get("/api/teacher/students", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.TEACHER) return res.status(403).json({ message: "Forbidden" });
  const userId = req.user.userId;
  const { moduleId } = req.query;
  try {
    const where: any = {
      modules: { teacherId: userId },
      status: "PAID"
    };
    if (moduleId) where.moduleId = moduleId;

    const enrollments = await prisma.enrollments.findMany({
      where,
      include: {
        users: { select: { id: true, email: true, fullName: true, username: true, isActive: true, profilePhotoUrl: true } as any },
        modules: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(enrollments);
  } catch (err) { res.status(500).json({ message: "Error fetching students" }); }
});

// Teacher: Get their courses with full meeting and enrollment details
app.get("/api/teacher/courses", verifySession, async (req: any, res) => {
  if (req.user.role !== users_role.TEACHER) return res.status(403).json({ message: "Forbidden" });
  try {
    const courses = await prisma.modules.findMany({
      where: { teacherId: req.user.userId },
      include: {
        enrollments: { select: { id: true, status: true, amount: true, userId: true } },
        live_classes: { orderBy: { scheduledAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: "Error fetching courses" }); }
});


// User: Update own profile
app.put("/api/auth/profile", verifySession, async (req: any, res) => {
  const userId = req.user.userId;
  const { fullName, mobileNumber, whatsappNumber, profilePhotoUrl, shortBio } = req.body;
  try {
    const updated = await (prisma.users as any).update({
      where: { id: userId },
      data: {
        fullName: fullName || undefined,
        mobileNumber: mobileNumber || undefined,
        whatsappNumber: whatsappNumber || undefined,
        profilePhotoUrl: profilePhotoUrl || undefined,
        shortBio: shortBio || undefined,
        updatedAt: new Date()
      }
    });
    const { password: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) { res.status(500).json({ message: "Error updating profile" }); }
});

// --- Vite Integration ---


async function startServer() {
  // Always bootstrap users to ensure admin credentials in .env are synchronized and hashed
  await bootstrapUsers().catch(err => {
    console.error("[BOOTSTRAP] System synchronization failed:", err);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Log environment variable status (without values)
    const requiredVars = [
      "DATABASE_URL",
      "JWT_SECRET",
      "ZOOM_SDK_KEY",
      "ZOOM_SDK_SECRET",
      "ZOOM_ACCOUNT_ID",
      "ZOOM_CLIENT_ID",
      "ZOOM_CLIENT_SECRET"
    ];
    console.log("--- Environment Configuration ---");
    requiredVars.forEach(v => {
      console.log(`${v}: ${process.env[v] ? "OK" : "MISSING"}`);
    });
    console.log("---------------------------------");
  });
}

startServer();
