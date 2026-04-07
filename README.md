# EDU-LMS Platform (Enterprise Edition) 🚀

A high-performance, premium **Educational Learning Management System** designed for professional education providers. This platform features a state-of-the-art **Red-Themed Dashboard**, enterprise-grade security, and native **Zoom Meeting SDK v3.x** integration for a seamless, centered, and immersive in-browser live learning experience.

---

## 🏗️ Technical Architecture

The EDU-LMS platform follows a robust **three-tier architecture** optimized for low-latency and maximum security:

### 1. Presentation Layer (Frontend)
- **Framework**: React 18 + Vite (for instant HMR and optimized builds).
- **Styling**: **Tailwind CSS v4** with a custom **Premium Red (#f3184c)** dark-theme design system.
- **Micro-Interactions**: **Framer Motion** for smooth glassmorphism transitions and layout animations.
- **Streaming**: Native **Zoom Meeting SDK (Client View)** embedded directly into the dashboard context to avoid external redirects.

### 2. Service Layer (Backend)
- **Runtime**: Node.js with **tsx** for high-performance direct TypeScript execution.
- **API**: Express.js RESTful API endpoints for secure identity and resource management.
- **Integration**: Direct Server-to-Server communication with **Zoom API** for meeting automation.
- **Safety**: End-to-end TypeScript implementation ensures strict data structure validation.

### 3. Data Layer (Persistence)
- **Database**: **MySQL** (Relational) for structured academic data.
- **ORM**: **Prisma** for type-safe database queries and automated schema migrations.
- **Efficiency**: Connection pooling and optimized indexing for fast dashboard retrieval.

---

## 🛠️ Core Technology Stack

| Category | technologies | Standardized Detail |
| :--- | :--- | :--- |
| **Core** | React 18, Vite, Node.js | Modern full-stack skeleton. |
| **Styling** | **Tailwind v4**, Vanilla CSS | Premium Glassmorphism & Red Accents. |
| **ORM/DB** | Prisma v5+, MySQL 8 | Enterprise data persistence. |
| **Live Sync** | **Zoom SDK (Native)** | Centered, full-screen browser experience. |
| **Identity** | JWT, Argon2/Bcrypt | High-entropy authentication protocol. |
| **UI Components**| **shadcn/ui**, Lucide, Hugeicons | Premium, accessible design primitives. |

---

## 🔐 Security & Identity Protocol

The EDU-LMS platform implements a robust, enterprise-grade authentication ecosystem designed for maximum security and operational clarity.

### 🔄 End-to-End Authentication Lifecycle

#### 1. Identity Provisioning (Signup)
- **Multi-Role Onboarding**: Users register as either a **Student** or a **Teacher**.
- **Cryptographic Security**: Passwords undergo high-entropy hashing using **bcryptjs** (salt factor 10) before storage.
- **Role-Based Gatekeeping**:
  - **Students**: Automatically verified upon signup for immediate access.
  - **Teachers**: Initial state is set to `PENDING`. Access is restricted to an "Awaiting Approval" interface until a System Administrator manually validates the facilitator's credentials via the Admin Control Center.

#### 2. Identity Verification (Login)
- **Dual-Factor Validation**: Users authenticate using either their email or unique username.
- **Concurrent Login Prevention**: To prevent unauthorized account sharing and enhance data integrity, the system **invalidates all previous sessions** for a user upon a new successful login. 
- **Session Issuance**: A secure **JSON Web Token (JWT)** is generated, containing the user's `userId`, `role`, and a unique `sessionId`.

#### 3. Session Persistence & Safety
- **Stateless Authorization**: The JWT is stored in the browser's `localStorage` and transmitted in the `Authorization: Bearer <token>` header for all API interactions.
- **Server-Side Session Tracking**: Every request undergoes a two-step validation:
  1. **JWT Verification**: Ensures the token is signed and the 24-hour expiration hasn't passed.
  2. **Active Session Check**: The system queries the database to ensure the `sessionId` is current. If a user logs in on a new device, the old token will trigger an immediate, safe eviction (LOGOUT) on the original device.

#### 4. Defensive Engineering
- **SQL Injection Defense**: All database interactions via Prisma ORM are automatically parameterized.
- **Cross-Origin Security**: Strict COEP (Cross-Origin Embedder Policy) and COOP (Cross-Origin Opener Policy) headers protect data when utilizing the embedded Zoom SDK.

---

## 🚀 Deployment & Operations

The platform is native-ready for **Coolify**, **Vercel**, or **Docker** (using Nixpacks/Buildpacks).

### Production Command
To launch the enterprise application in a live environment:
```bash
npx tsx server.ts
```

### Critical Environment Setup
Ensure the following variables are configured in your production vault:
- `DATABASE_URL`: Your MySQL connection string.
- `JWT_SECRET`: A high-entropy random string for token signing.
- `ZOOM_SDK_KEY` / `ZOOM_SDK_SECRET`: From your Zoom Marketplace **Meeting SDK** App.
- `ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET`: For OAuth 2.0 automated meeting creation.

---

## 🧪 Global Features

1. **System Control Center (Admin)**: Real-time stats, revenue monitoring, and teacher application review.
2. **Facilitator Suite (Teacher)**: Intuitive class scheduler, automated Zoom room creation, and student rosters.
3. **Scholar Portfolio (Student)**: Visual course discovery, one-click "Join Room" functionality, and resource access.
4. **Native Meeting Context**: Centered, centered, and centered. The Zoom UI is fully integrated into the premium LMS design.
5. **Responsive Integrity**: Full desktop, tablet, and mobile compatibility across all dashboards.

---

## 🔑 Test Credentials (Dev Environment)

| Archetype | Verification Email | Access Password |
| :--- | :--- | :--- |
| **Admin** | `admin@mail.com` | `password123` |
| **Teacher** | `teacher1@mail.com` | `password123` |
| **Student** | `student1@mail.com` | `password123` |

---
*EDU-LMS v3.5 - Modernizing the digital classroom with premium design and absolute stability.*
