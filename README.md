# 🧠 VisualCV Builder

A modern web application built with **Next.js 15** and **Server Actions** that allows users to generate stylish CVs from structured input, save them, and export them as PDFs.

## ✅ Project Status

**FULLY IMPLEMENTED AND TESTED** ✅

- ✅ Complete database schema with Prisma
- ✅ NextAuth authentication system
- ✅ CV creation, editing, and management
- ✅ PDF generation with Puppeteer
- ✅ Route protection middleware
- ✅ Responsive UI with Tailwind CSS
- ✅ All API endpoints functional
- ✅ Database connection verified
- ✅ Development server running successfully

## 🧱 Tech Stack

- **Frontend**: Next.js 15 (App Router, Server Actions)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: NextAuth.js with credentials provider
- **PDF Generation**: Puppeteer
- **Storage**: Local file system for generated PDF files

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd visual-cv-builder
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your actual values:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/visualcv_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database
   npm run db:push
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🧪 Testing the Application

### 1. Homepage Testing

- Visit `http://localhost:3000`
- Verify the landing page loads with hero section and features
- Test navigation buttons (Get Started, Sign In)

### 2. Authentication Flow

- Navigate to `/auth/signup`
- Create a new account with email and password
- Sign in at `/auth/signin`
- Verify session persistence across page refreshes

### 3. CV Management

- After signing in, navigate to `/cv` (CV Dashboard)
- Click "Create New CV" to access the CV builder
- Fill out the CV form with sample data
- Use the live preview feature to see changes in real-time
- Save the CV and return to dashboard

### 4. PDF Generation

- From the CV dashboard, click "Generate PDF" on any CV
- Verify PDF downloads successfully
- Open the PDF to ensure proper formatting

### 5. Route Protection

- Try accessing `/cv` without authentication
- Should redirect to signin page with proper callback URL

## 🛠️ Verified Features

### Authentication System ✅

- User registration with email/password
- Secure password hashing with bcrypt
- Session management with NextAuth
- Route protection middleware

### CV Management System ✅

- Create new CVs with comprehensive form
- Edit existing CVs
- Delete CVs from dashboard
- Live preview during editing

### PDF Generation ✅

- Generate high-quality PDFs using Puppeteer
- Professional CV templates
- Download functionality
- File storage in `public/cv-files/`

### Database Integration ✅

- PostgreSQL with Prisma ORM
- User, CV, Account, Session models
- Proper relationships and constraints
- Migration system in place

## 📁 Project Structure

```
visual-cv-builder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── cv/            # CV management endpoints
│   │   ├── auth/              # Authentication pages
│   │   ├── cv/                # CV management pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── CVForm.tsx         # CV creation/editing form
│   │   ├── CVPreview.tsx      # Live CV preview
│   │   ├── CVDashboard.tsx    # CV management dashboard
│   │   ├── Navbar.tsx         # Navigation component
│   │   └── SessionProvider.tsx # Auth session provider
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Prisma client
│   │   ├── generate-pdf.ts   # PDF generation logic
│   │   └── session.ts        # Session helpers
│   └── middleware.ts          # Route protection
├── prisma/
│   └── schema.prisma         # Database schema
├── public/
│   └── cv-files/            # Generated PDF storage
└── README.md
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm prisma studio` - Open Prisma Studio

## 📄 API Routes

### Authentication

- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### CV Management

- `GET /api/cv` - Get user's CVs
- `POST /api/cv` - Create new CV
- `GET /api/cv/[id]` - Get specific CV
- `PUT /api/cv/[id]` - Update CV
- `DELETE /api/cv/[id]` - Delete CV
- `POST /api/cv/[id]/generate` - Generate PDF for CV
- `GET /api/cv/[id]/download` - Download CV PDF

## 🗄️ Database Schema

### User

- `id`, `email`, `password` (hashed), `name`, `createdAt`
- Relations: `CV[]`, `accounts`, `sessions`

### CV

- `id`, `userId`, `title`, `content` (JSON), `template`, `filePath`
- `createdAt`, `updatedAt`

### Auth Models (NextAuth)

- `Account`, `Session`, `VerificationToken`

## 🔒 Security Features

- Input sanitization (XSS/HTML injection prevention)
- Secure password storage using bcrypt
- File access control for generated PDFs
- Session-based authentication
- Protected API routes

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
```

### Build and Deploy

```bash
pnpm build
pnpm start
```

## 🔧 Development

### Database Operations

```bash
# Reset database
pnpm prisma migrate reset

# View data
pnpm prisma studio

# Generate client after schema changes
pnpm prisma generate
```

### Adding New CV Templates

1. Create template function in `src/lib/generate-pdf.ts`
2. Add template option to CV creation form
3. Update template selection logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**

   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file

2. **PDF generation fails**

   - Ensure Puppeteer dependencies are installed
   - Check file permissions for `public/cv-files` directory

3. **Authentication issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain

### Getting Help

- Check the Issues page
- Review the Documentation
- Contact the maintainers

---

Built with ❤️ using Next.js 15 and modern web technologies.
