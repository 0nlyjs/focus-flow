# FocusFlow ⏱️

FocusFlow is a premium, minimalist full-stack time-management web application designed to help users track focus blocks, set countdowns or stopwatch targets, and build better productivity habits.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router, React 19)
- **Styling**: Tailwind CSS & Lucide React Icons
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth.js v5) with SMTP Email (Magic Link) Provider

---

## ⚡ Rendering & Routing Strategies

FocusFlow demonstrates a strict and effective use of Next.js rendering strategies:

### 1. Landing Page (`/`) - **Static Site Generation (SSG)**
- **Behavior**: Pre-rendered statically at build time for blistering page speeds and optimal SEO.
- **Mechanism**: The page is fully static and utilizes a Server Action to secure magic link emails when logging in, avoiding server request-time overhead.

### 2. Main Dashboard (`/dashboard`) - **Server-Side Rendering (SSR)**
- **Behavior**: A dynamically served, authenticated workspace protected by Middleware.
- **Mechanism**: Fetches the user's focus sessions from PostgreSQL on the server at request time before delivering the HTML, ensuring data consistency.
- **Client State**: Employs client-side React state for interactive ticking timers (countdown and count up), dynamic sidebar transitions, and optimistic updates.

### 3. Global Stats (`/global-stats`) - **Incremental Static Regeneration (ISR)**
- **Behavior**: An aggregate metrics landing page revalidated in the background.
- **Mechanism**: Configured with `revalidate = 60` to cache aggregate focus hours, completed blocks, and creator numbers, rebuilding the page at most once every minute to reduce database load.

---

## 🛰️ Data Mutation & Architecture

FocusFlow maintains a clean division of concern between Server Actions (for standard form postings) and RESTful API Routes (for client-side asynchronous UI flows):

### 1. Server Actions (`"use server"`)
- **Action**: `createTask` in `src/app/actions/task-actions.ts`.
- **Purpose**: Captures the initial form submission to write a new focus block. It validates task properties using **Zod**, asserts the session user ID, records the entry via Prisma, and invalidates the dashboard layout cache using `revalidatePath('/dashboard')`.

### 2. RESTful API Routes (`/api/tasks/[id]`)
- **PATCH / PUT**: Resolves parameters, checks database ownership, updates the task's final `spentTime`, and sets `isCompleted: true` when the ticking timer resolves.
- **DELETE**: Securely removes the specified task from the database. Called when the user clicks the trash icon in the completed sidebar panel.

---

## 🛠️ Local Setup Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** instance running locally or via cloud (e.g. Neon, Supabase)
- **SMTP Server** credentials (for testing magic links; you can use services like Resend, Sendgrid, Mailtrap, or Gmail SMTP)

### 2. Installation
Clone and navigate to the project directory, then install the dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and copy values from `.env.example`:
```bash
cp .env.example .env
```
Fill in the variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: Secret hash for Auth.js cookies (generate using `npx auth secret`).
- `EMAIL_SERVER`: SMTP server string (e.g., `smtp://username:password@smtp.mailtrap.io:2525`).
- `EMAIL_FROM`: The verified sender address (e.g., `FocusFlow <noreply@yourdomain.com>`).

### 4. Database Setup & Migrations
Sync your database schema and build the Prisma client mapping:
```bash
npx prisma db push
```

### 5. Running the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your FocusFlow workspace!
