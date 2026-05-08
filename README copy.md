# 🚀 Modern Dashboard with Advanced Auth

**Next.js 16 (App Router) | React 19 | Tailwind CSS 4 | Ant Design**

A high-performance, secure, and visually stunning dashboard assessment. This project demonstrates a deep understanding of modern React patterns, server-side logic, and scalable architecture.

## ✨ Key Features

- **🔐 Advanced Authentication**: Full authentication flow using Next.js Server Actions and Middleware.
- **🛡️ Enhanced Security**: Secure session management using HttpOnly Cookies and JWT (encrypted via `jose`).
- **📊 Pro Dashboard**: Fully responsive layout featuring an interactive Sidebar, Navbar, and Customer Management module.
- **🎭 Smooth Animations**: Fluid page transitions and interactive elements powered by Framer Motion.
- **🏗️ Scalable Architecture**: Implementation of the Feature-based Pattern for clean code organization.
- **🧪 Modern Tech Stack**: Utilizing the latest React 19 hooks like `useActionState` and `useFormStatus`.

## 🏗️ Architectural Decisions

### 📂 The Feature-based Pattern

I opted for a Feature-based Architecture instead of a traditional flat folder structure. In this project, all logic related to a specific domain (e.g., auth, customers) is encapsulated within its own directory under `src/features/`.

**Why this approach?**

- **Scalability**: As the project grows, a flat structure becomes cluttered. This pattern keeps the codebase manageable by grouping related actions, components, hooks, and types together.
- **Maintainability**: It isolates changes. Modifying the authentication flow won't require hunting through global folders; everything is contained within `features/auth`.
- **Separation of Concerns**: It clearly distinguishes between Global Components (reusable UI) and Feature Components (domain-specific logic).

### ⚡ Server Actions vs. API Routes

Instead of traditional API endpoints, I leveraged Server Actions to handle logic. This reduces client-side JavaScript, improves SEO, and provides a more seamless "Progressive Enhancement" experience.

## 🛠️ Setup & Installation

Follow these steps to get the project running locally:

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd dashboard-template
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the result.

## 🔑 Demo Credentials

To explore the protected dashboard, use the following mock credentials:

- **Email**: `admin@example.com`
- **Password**: `password123`

## 🧪 Tech Stack Summary

| Technology         | Purpose                                 |
| ------------------ | --------------------------------------- |
| **Next.js 16**     | Full-stack Framework (App Router)       |
| **React 19**       | UI Library (using New Hooks)            |
| **Tailwind CSS 4** | Modern Utility-first Styling            |
| **Ant Design**     | Professional UI Component Library       |
| **Framer Motion**  | Declarative Animations                  |
| **Zod**            | Schema Validation & Type Safety         |
| **Jose**           | Lightweight JWT Encryption (Edge Ready) |
