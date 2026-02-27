# AI Resume Screening App

A full-stack resume screening application with a real ATS (Applicant Tracking System) scoring engine. Upload your resume and get an instant, detailed breakdown across 8 scoring categories — just like how real recruiters evaluate candidates.

## Live Demo

- **Frontend:** [ai-resume-client-one.vercel.app](https://ai-resume-client-one.vercel.app)
- **Backend API:** [ai-resume-screening-taupe.vercel.app](https://ai-resume-screening-taupe.vercel.app)

## Features

- **8-Category ATS Scoring** — Resumes scored across Section Detection, Skills Matching, Experience Quality, Education, Formatting, Contact Info, Keyword Relevance, and Achievements
- **150+ Skills Database** — Categorized skills with 200+ aliases (e.g., JS = JavaScript, K8s = Kubernetes)
- **Detailed Score Breakdown** — Visual progress bars per category with score/max display
- **Analysis Metadata** — Years of experience, degree level, word count, action verbs, certifications, and more
- **Categorized Skills Display** — Skills grouped by category (Frontend, Backend, DevOps, etc.)
- **Job Recommendations** — Automatic job matching based on detected resume skills
- **Resume Management** — Upload, re-analyze, and delete resumes
- **Employer Dashboard** — Post jobs, view applicants, manage applications
- **User Profiles** — Avatar upload, theme toggle (light/dark), bio, password change
- **Role-Based Access** — Job seeker and employer roles with separate dashboards

## Scoring Categories (100 pts total)

| Category | Max Pts | What it checks |
|---|---|---|
| Section Detection | 10 | Summary, Experience, Education, Skills, Contact, Certifications, Projects |
| Skills Matching | 25 | 150+ skills with aliases, grouped by category |
| Experience Quality | 20 | Action verbs, quantified achievements, years of experience, bullet structure |
| Education | 10 | Degree level (PhD > Masters > Bachelors > Diploma), relevant field, certifications |
| Formatting & Structure | 10 | Content length, section count, bullet points, line count |
| Contact Information | 5 | Email, phone, LinkedIn, GitHub/portfolio |
| Keyword Relevance | 10 | Industry keywords, keyword stuffing detection (penalty) |
| Achievements & Impact | 10 | Quantified results, leadership indicators, project quality |

## Tech Stack

### Frontend
- React 19 + Vite
- React Router v7
- Axios
- React Hot Toast
- React Icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- pdf-parse (PDF text extraction)

### Deployment
- Vercel (frontend + backend serverless)
- MongoDB Atlas (cloud database)

## Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Layout, Navbar, Sidebar, PrivateRoute
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── pages/           # Home, Dashboard, Resumes, Jobs, Profile, etc.
│   │   ├── services/        # API client (Axios)
│   │   └── index.css        # Full stylesheet with light/dark theme
│   └── vercel.json          # SPA rewrite rules
├── server/                  # Express backend
│   ├── config/              # Database connection
│   ├── controllers/         # Auth, Resume, Job, Analytics, Employer, User
│   ├── middleware/           # Auth, Role, Upload
│   ├── models/              # User, Resume, Job schemas
│   ├── routes/              # API routes
│   ├── utils/               # Resume parser + ATS scoring engine
│   └── vercel.json          # Serverless config
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/jitinnailwal/ai-resume-screening.git
   cd ai-resume-screening
   ```

2. **Setup the server**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/ai-resume-app
   JWT_SECRET=your_secret_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

3. **Setup the client**
   ```bash
   cd ../client
   npm install
   ```

4. **Run both**
   ```bash
   # Terminal 1 — server
   cd server && npm run dev

   # Terminal 2 — client
   cd client && npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

### Seed Sample Jobs (optional)
```bash
cd server && node seed.js
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/resumes/upload` | Upload & analyze resume |
| GET | `/api/resumes` | Get user's resumes |
| POST | `/api/resumes/:id/reanalyze` | Re-analyze a resume |
| POST | `/api/resumes/reanalyze-all` | Re-analyze all resumes |
| GET | `/api/resumes/recommendations` | Get job recommendations |
| GET | `/api/jobs` | List jobs |
| POST | `/api/jobs` | Create job (employer) |
| POST | `/api/jobs/:id/apply` | Apply to job |
| GET | `/api/analytics/dashboard` | User dashboard stats |
| GET | `/api/employer/dashboard` | Employer dashboard |

## License

MIT
