# 🧠 VisualCVBuilder – System Design

A modern web application built with **Next.js 15** and **Server Actions** that allows users to generate stylish CVs from structured input, save them, and export them as PDFs.

---

## 🧱 Tech Stack

- **Frontend**: Next.js 15 (App Router, Server Actions)
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: NextAuth.js with credentials provider
- **Storage**: Local file system for generated PDF files

---

## 🔐 Authentication

### Auth Stack

- NextAuth.js with credentials provider (email & password)
- Prisma Adapter for session/account management
- Passwords stored using bcrypt hashing

### Auth Features

- User registration and login
- Session-based access control
- Protected routes for CV creation/editing

---

## 🧾 Database Schema (Prisma)

### User Model

- id, email, password (hashed), name, createdAt
- relations: `CV[]`, `accounts`, `sessions`

### CV Model

- id, userId, title, content (JSON), template, filePath
- createdAt, updatedAt

### Auth Models (for NextAuth)

- `Account`, `Session`, `VerificationToken`

---

## ⚙️ Server Actions

Used for:

- Register/login with NextAuth
- Saving CV data to PostgreSQL
- Rendering HTML templates for CV preview/generation
- Generating PDF from HTML (using Puppeteer or Playwright)
- Saving files to local `/public/cv-files` directory

---

## 📁 Folder Structure

```
/src
  /app
    /cv                    ← View, create, edit CVs
    /auth                  ← Login, register, logout pages
    /api
      /auth/[...nextauth]  ← Auth API route
      /cv/[id]/download    ← API route to download generated PDF
  /components              ← UI components
  /lib
    db.ts                  ← Prisma client
    auth.ts                ← NextAuth config
    session.ts             ← Session helpers
    generate-pdf.ts        ← HTML to PDF logic
/public
  /cv-files                ← Stored PDF files
/prisma
  schema.prisma            ← Prisma schema
```

---

## 📄 PDF Generation & Download

- CVs are converted from HTML to PDF using Puppeteer/Playwright.
- Files are saved to `public/cv-files/{filename}.pdf`.
- Users can download their own CVs using an API route:
  - `/api/cv/[id]/download`
- Auth checks ensure only the file owner can download the file.
- Files are served with proper `Content-Disposition` and `Content-Type` headers.

### API Route Sample

```ts
GET /api/cv/[id]/download

- Authenticated
- Checks file ownership
- Returns PDF file as attachment
```

---

## ✅ MVP Features

- [x] User registration & login (NextAuth + bcrypt)
- [x] CV form input (name, experience, education, etc.)
- [x] Live preview of CV design
- [x] Export CV as PDF (stored locally)
- [x] User dashboard to manage multiple CVs

---

## 🚀 Future Enhancements

- Add more templates and themes
- AI-assisted CV content generation
- Public CV link sharing
- Cover letter generator
- Mobile-responsive CV formats
- Export as HTML or Markdown

---

## 🔒 Security Considerations

- Input sanitization (XSS/HTML injection prevention)
- Secure password storage using bcrypt
- File access control for generated PDFs
- Rate limiting for PDF generation

---

## 🧠 Summary

This app provides a sleek, full-featured CV generation experience built with modern tooling, supports login/session management, and stores both structured user data and generated files effectively.
