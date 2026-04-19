# EDU-LMS Platform (Enterprise Edition) 🚀

A high-performance, premium **Educational Learning Management System** designed for professional education providers. This platform features a state-of-the-art **Red-Themed Dashboard**, enterprise-grade security, native **Zoom Meeting SDK v3.x** integration, and scalable cloud storage for a seamless, centered, and immersive in-browser live learning experience.

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
- **File Management**: Direct integration with **Backblaze B2 Cloud Storage**.
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
| **Storage** | **Backblaze B2** / `@backblaze/b2` | Global single-bucket strategy for materials. |
| **Identity** | JWT, Argon2/Bcrypt | High-entropy authentication protocol. |
| **UI Components**| **shadcn/ui**, Lucide, Hugeicons | Premium, accessible design primitives. |

---

## ☁️ Cloud Infrastructure & Integrations

### 📦 Backblaze B2 Storage Strategy
The system utilizes a secure, scalable **Single Bucket Strategy** (Recommended for 99% of apps) acting as a centralized CDN repository for all academic materials (PDFs, docs, images).
- **Global Bucket Name**: `lms-materials-bucket`
- **File Routing Architecture**: Documents are seamlessly isolated using a strict path system: `classes/{classId}/materials/{filename}`
- **Security**: The bucket is inherently private, managed explicitly through backend-signed endpoints securely delivering materials purely through authorized sessions.

### 📺 Video Archiving (YouTube)
To conserve core bandwidth and preserve ultra-fast storage exclusively for physical handouts, video logs are heavily integrated utilizing **YouTube Embeds**. 
- **Teacher Flow**: Facilitators paste public or unlisted YouTube video references.
- **Architecture**: The LMS parses the embed context and integrates it into a custom, isolated `iframe` theater, protecting viewers from cross-site cookies utilizing `credentialless="true"`.
- **Display**: Logs fall cleanly under **ARCHIVES** to distinguish post-live asynchronous learning assets.

---

## 🔐 Security & Identity Protocol

The EDU-LMS platform implements a robust, enterprise-grade authentication ecosystem designed for maximum security and operational clarity.

### 🔄 End-to-End Authentication Lifecycle

#### 1. Identity Provisioning (Signup)
- **Multi-Role Onboarding**: Users register as either a **Student** or a **Teacher**.
- **Cryptographic Security**: Passwords undergo high-entropy hashing using **bcryptjs** (salt factor 10) before storage.
- **Role-Based Gatekeeping**:
  - **Students**: Automatically verified upon signup for immediate access.
  - **Teachers**: Initial state is set to `PENDING`. Access is restricted to an "Awaiting Approval" interface until a System Administrator manually validates the facilitator.

#### 2. Identity Verification (Login)
- **Dual-Factor Validation**: Users authenticate using their email or unique username.
- **Concurrent Login Prevention**: The system **invalidates all previous sessions** for a user upon a new successful login, enhancing pure data integrity.
- **Session Issuance**: A secure **JSON Web Token (JWT)** is generated alongside a tracked `sessionId`.

#### 3. Session Persistence & Safety
- **Stateless Authorization**: JWT is safely stored and transmitted via `Authorization: Bearer <token>`.
- **Server-Side Tracking**: Requests actively cross-validate JWT decoding against the live database `sessionId`.

---

## 🚀 Deployment & Operations

The platform is native-ready for **Coolify**, **Vercel**, or **Docker** (using Nixpacks/Buildpacks).

### Production Command
To launch the enterprise application in a live environment:
```bash
npx tsx server.ts
```

### Critical Environment Setup (Vault Config)
Ensure the following variables are established perfectly inside your `.env` for production usage:

```env
# Relational DB
DATABASE_URL="mysql://..."

# Security
JWT_SECRET="super-strong-hash-key"

# Zoom Embedded Web SDK Integration
ZOOM_SDK_KEY="Your-SDK-Key"
ZOOM_SDK_SECRET="Your-SDK-Secret"

# Zoom Server-To-Server Automation
ZOOM_CLIENT_ID="Your-Client-ID"
ZOOM_CLIENT_SECRET="Your-Client-Secret"
ZOOM_ACCOUNT_ID="Your-Account-ID"

# Backblaze B2 Storage Architecture
B2_KEY_ID="Your-Key-ID"
B2_APPLICATION_KEY="Your-Application-Key"
B2_BUCKET_NAME="lms-materials-bucket"
```

---

## 🧪 Global Features

1. **System Control Center (Admin)**: Real-time stats, revenue monitoring, and application review.
2. **Facilitator Suite (Teacher)**: Intuitive class scheduler, automated Zoom room creation, Student rosters, Cloud handouts, and Archive tracking.
3. **Scholar Portfolio (Student)**: Visual course discovery, one-click "Join Room" functionality, and direct material retrieval.
4. **Native Meeting Context**: Centered full-screen Zoom integration preserving application routing flawlessly mapped onto the premium UI.
5. **Responsive Integrity**: Full desktop, tablet, and mobile parity guaranteeing precise alignment universally without overlaps.

---

## 🔑 Test Credentials (Dev Environment)

| Archetype | Verification Email | Access Password |
| :--- | :--- | :--- |
| **Admin** | `admin@mail.com` | `password123` |
| **Teacher** | `teacher1@mail.com` | `password123` |
| **Student** | `student1@mail.com` | `password123` |

---
*EDU-LMS v3.6 - Modernizing the digital classroom with premium design, cloud logic, and absolute stability.*
