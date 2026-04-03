# EDU-LMS (Educational Learning Management System)

A premium, full-stack learning platform built for speed, security, and a beautiful user experience. This system integrates a custom React/Vite frontend with an Express/Prisma backend, featuring native Zoom Meeting SDK integration for live classes.

---

## 🎨 Design & UI Philosophy
The application follows a **Modern Premium Aesthetic** featuring:
- **Bento-Grid Dashboard**: A functional, organized layout for quick information access.
- **Glassmorphism**: Sleek, frosted-glass effects for a futuristic, lightweight feel.
- **Dynamic Animations**: Smooth transitions and hover interactions to keep the UI engaging.
- **Mobile-Responsive**: Fully optimized for tablets, phones, and desktops.

---

## 🛠️ Technology Stack
### Frontend
- **React 18 + Vite**: Lightning-fast development and build times.
- **TailwindCSS + Vanilla CSS**: Custom-themed design tokens and glass-styled utilities.
- **Hugeicons**: Pro-grade icon set for a consistent visual language.
- **Zoom Meeting SDK (Client View V5+)**: Embedded video meeting experience within the app dashboard.

### Backend
- **Node.js + Express**: Core application server logic.
- **TypeScript**: Type-safe development for both frontend and backend.
- **Prisma ORM**: Modern database modeling and querying.
- **MySQL**: Persistent relational data storage.

### Security
- **Bcrypt.js**: High-entropy password hashing (no plain text storage).
- **JSON Web Tokens (JWT)**: Secure, signed authentication tokens for stateless user sessions.
- **Concurrent Login Protection**: Database-backed session tracking to prevent multiple logins on different devices.

---

## 🔐 Authentication & Access Control
The system uses **Role-Based Access Control (RBAC)** to ensure data security:
- **ADMIN**: Access to full data clearing and overall system oversight.
- **TEACHER**: Can create modules (courses), schedule live classes, and manage student attendance.
- **STUDENT**: Can enroll in courses and join scheduled live meetings directly via the browser.

---

## 🚀 Deployment Guide (Coolify / Render / Docker)
The application is **Nixpacks-ready** and optimized for containerized environments.

### Recommended Start Command
To run the TypeScript server in production without manual transpilation:
```bash
npx tsx server.ts
```

### Essential Environment Variables
Ensure the following keys are configured in your production dashboard:
- `DATABASE_URL`: Your MySQL connection string.
- `JWT_SECRET`: A long, unique string for signing tokens.
- `ZOOM_SDK_KEY` / `ZOOM_SDK_SECRET`: Your Zoom SDK credentials.
- `ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET`: OAuth credentials for meeting join support.

---

## 🧪 Test Credentials
*The following accounts are automatically bootstrapped on the first server start:*

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@mail.com` | `password123` |
| **Teacher** | `teacher1@mail.com` | `password123` |
| **Student** | `student1@mail.com` | `password123` |

---

## ⚙️ Development Setup
1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Database Migration**:
   ```bash
   npx prisma db push
   ```
3. **Local Start**:
   ```bash
   npm run dev
   ```
   *Runs by default on [http://localhost:3002](http://localhost:3002)*
