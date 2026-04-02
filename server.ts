import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import KJUR from "jsrsasign";
import dotenv from "dotenv";
import { PrismaClient, users_role } from "@prisma/client";
import bcrypt from "bcryptjs";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
const prisma = new PrismaClient();

// Bootstrap test users
async function bootstrapUsers() {
  const testUsers = [
    { email: "admin@mail.com", username: "admin", password: "password123", role: users_role.ADMIN },
    { email: "teacher1@mail.com", username: "teacher1", password: "password123", role: users_role.TEACHER },
    { email: "student1@mail.com", username: "student1", password: "password123", role: users_role.STUDENT },
  ];

  for (const user of testUsers) {
    try {
      const existing = await prisma.users.findFirst({ 
        where: { 
          OR: [
            { email: user.email },
            { username: user.username }
          ]
        } 
      });
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      if (!existing) {
        const newUser = await prisma.users.create({
          data: {
            id: uuidv4(),
            email: user.email,
            username: user.username,
            password: hashedPassword,
            role: user.role,
            isVerified: true,
            updatedAt: new Date(),
          },
        });
        console.log(`Bootstrapped user: ${user.email}`);
  
        // Add sample data for teacher1
        if (user.username === "teacher1") {
          const courseId = uuidv4();
          await prisma.modules.create({
            data: {
              id: courseId,
              name: "A/L Combine Maths",
              description: "Advanced Level Combined Mathematics for students.",
              price: 50.0,
              color: "#3b82f6",
              type: "COURSE",
              teacherId: newUser.id,
              startDate: new Date(),
              startTime: "10:00",
              endTime: "12:00",
              updatedAt: new Date()
            }
          });
  
          await prisma.live_classes.create({
            data: {
              id: uuidv4(),
              title: "Introduction to Calculus",
              moduleId: courseId,
              scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
              duration: 60,
              zoomMeetingId: "1234567890",
              zoomPassword: "zoompassword",
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Ensure password is correct even if user existed with old password
        await prisma.users.update({
          where: { id: existing.id },
          data: { 
            password: hashedPassword,
            role: user.role // Ensure role is correct too
          }
        });
      }
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`Bootstrap: User ${user.email} or ${user.username} already exists (Unique constraint conflict), skipping.`);
      } else {
        console.error(`Bootstrap error for ${user.email}:`, err);
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

// Auth: Signup
app.post("/api/auth/signup", async (req, res) => {
  const { email, username, password, role } = req.body;

  try {
    // Only allow STUDENT signup publicly, or TEACHER if specified (for testing)
    const signupRole = role === "TEACHER" ? users_role.TEACHER : users_role.STUDENT;
    
    // Check if user exists
    const existing = await prisma.users.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await prisma.users.create({
        data: {
          id: uuidv4(),
          email,
          username,
          password: hashedPassword,
          role: signupRole,
          isVerified: true,
          updatedAt: new Date(),
        },
      });
    } catch (createError: any) {
      if (createError.code === 'P2002') {
        const target = createError.meta?.target;
        const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');
        if (targetStr.includes('email')) {
          return res.status(400).json({ message: "Email already in use" });
        }
        if (targetStr.includes('username')) {
          return res.status(400).json({ message: "Username already in use" });
        }
        return res.status(400).json({ message: "User already exists (Unique constraint violation)" });
      }
      throw createError; // Re-throw if not a unique constraint error
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.users.findUnique({ 
      where: { email },
      include: { sessions: true }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Direct comparison for bootstrapped users or bcrypt
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false) || password === user.password;
    
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
  const { name, description, imageUrl, price, startDate, startTime, endTime, type, color } = req.body;
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

// --- Vite Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
