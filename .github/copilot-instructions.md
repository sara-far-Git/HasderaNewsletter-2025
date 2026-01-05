# Hasdera Newsletter - Copilot Instructions

## 🏗️ Architecture Overview

**Hasdera** is a multi-role digital newsletter platform with monetization through advertising.

### Tech Stack
- **Backend**: ASP.NET Core 8.0, Entity Framework Core 9, PostgreSQL (RDS), AWS S3
- **Frontend**: React 19 + Vite 7, Tailwind CSS, styled-components
- **Authentication**: JWT tokens + Google OAuth
- **Analytics**: Python Flask service, Dapper ORM for raw SQL queries
- **Deployment**: Docker (backend on Render), Cloudflare Pages (frontend)

### Three User Roles (Protected Routes)
1. **Reader** - View published newsletters/issues with flipbook viewer
2. **Advertiser** - Upload creatives, place ads, view analytics
3. **Admin** - Manage users, content, payments, infrastructure

Each role has separate route files: `src/routes/{admin,advertiser,reader}Routes.jsx`

## 🔑 Critical Architecture Patterns

### Authentication Flow
- `AuthContext.jsx` manages app-wide auth state (localStorage: `hasdera_token`, `hasdera_user`)
- Token validation happens on app init via `fetchMe()` - if 401, user is logged out
- Google OAuth integration via `@react-oauth/google` with idToken exchange at `/User/google-login`
- JWT key in `appsettings.json` (7-day expiry)

### API Communication
- Axios instance in `src/Services/api.js` with automatic token injection
- Base URL: production uses `https://hasderanewsletter-2025.onrender.com/api`, dev uses `http://localhost:5055/api`
- CORS configured for localhost + `.hasdera-advertiser.pages.dev` domain
- Retry logic via `axios-retry` plugin

### File Uploads (S3 Integration)
- PDFs: `POST /Issues/upload-pdf` → stored in `hasdera-issues` bucket
- Creatives: `POST /Creatives/upload` → S3 with presigned URLs
- Pre-signed URL generation enabled (60-minute expiry) for secure access
- AWS credentials from `appsettings.json` or environment variables

### Data Models - Key Relationships
- **Issues** (newsletters) → **Slots** (ad placements) → **AdOrders** (advertiser bookings) → **Creatives** (ad assets)
- **Analytics** table tracks clicks, impressions, engagement per placement
- **ChatbotLog** records AI agent interactions
- **Readers** subscribe to Issues, **Advertisers** buy placement slots

### Pagination Pattern
API returns `PagedResult<T>` wrapper (not plain arrays):
```csharp
public class PagedResult<T> { 
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
}
```
Frontend expects `.items` and `.totalCount` properties.

## 📁 Key Files & Directories

| Path | Purpose |
|------|---------|
| `HasderaApi/Controllers/` | 8 main controllers: User, Issues, Analytics, Advertisers, Creatives, AdvertiserChat, AnalyticsChat, AnalyticsAgent |
| `HasderaApi/Services/` | AuthService, AiService (currently mock), GoogleTokenValidator |
| `HasderaApi/Models/` | 30+ EF entities (Issue, Ad, Creative, Analytics, etc.) |
| `hasdera-frontend/src/components/` | 35+ React components organized by feature |
| `hasdera-frontend/src/Services/` | API client layer (issuesService, advertisingService, analyticsService, etc.) |
| `analytics-python/scripts/` | Flask APIs for analytics, chatbot agents, demo data generation |

## 🔄 Development Workflow

### Running Locally
```powershell
# Backend (port 5055)
cd HasderaApi && dotnet run

# Frontend (port 5173)
cd hasdera-frontend && npm install && npm run dev

# Or concurrently
npm run start:all
```

### Build & Deployment
- **Backend**: Docker multi-stage build → Render (`PORT` env var required)
- **Frontend**: Vite build outputs to `dist/` → Cloudflare Pages
- Environment variables: `VITE_API_URL` (frontend) and `DB_CONNECTION_STRING` (backend)

### Database
- PostgreSQL on AWS RDS (eu-north-1)
- Connection string includes retry policy (5 retries, 10s delay)
- Query timeout: 300 seconds
- Use EF Core migrations (not raw SQL unless performance-critical)

## 🎯 Development Conventions

### C# Backend Patterns
- **Controllers**: RESTful endpoints, `[Authorize]` attributes for protected routes
- **DTOs**: Used for API requests (e.g., `RegisterDto`, `LoginDto`, `UpdateIssueRequest`)
- **Services**: Business logic in separate classes (e.g., `AuthService.cs`)
- **Error Handling**: Return `BadRequest()`, `NotFound()`, `Unauthorized()` with descriptive messages
- **Logging**: Comments in Hebrew; use `Console.WriteLine` for debugging

### React Frontend Patterns
- **Components**: Functional components with hooks, auth checks via `ProtectedRoute` wrapper
- **Contexts**: AuthContext for global state, avoid prop drilling
- **Services**: API clients in `src/Services/` import centralized `api` instance
- **Styling**: Tailwind + styled-components, theme in `src/styles/HasederaTheme.js`
- **RTL Support**: HTML is `dir="rtl"`, all components use RTL-aware layout

### Common Mistakes to Avoid
1. **Auth**: Token is checked on app init; don't add 401 handling in every component
2. **API URLs**: Use relative paths with `api` instance, not hardcoded `localhost`
3. **Pagination**: API returns objects with `.items` property, not arrays
4. **File Uploads**: Use FormData with `api.post()`, set headers to undefined for multipart
5. **Environment Config**: Use `import.meta.env.VITE_*` for frontend, appsettings.json for backend

## 🔌 Integration Points

### External Services
- **Google Cloud**: OAuth credentials in `appsettings.json` and `index.html`
- **AWS S3**: Used for PDF and creative asset storage
- **OpenAI/AI**: AiService is currently a mock; real integration needed for chat agents

### Cross-Component Communication
- Frontend-Backend: Axios API calls (token in Authorization header)
- Backend-Database: EF Core DbContext + Dapper for complex queries
- Backend-S3: IAmazonS3 client injected via DI
- Python Analytics: Separate Flask service, communicates via HTTP

## 📝 Code Comments & RTL Note

- Codebase uses Hebrew comments extensively (narrative explains "why", not "what")
- This is intentional for the Hebrew-speaking team
- When adding code, match the existing style (brief Hebrew comments for logic)

## � Known Issues & Fixes

### PDF Loading Issues
- **Problem**: S3 presigned URLs loaded directly cause "Invalid PDF structure" errors due to CORS
- **Solution**: Route S3 PDFs through `/api/issues/{id}/pdf` endpoint instead of direct S3 access
- **Location**: [AdminFlipbookViewer.jsx](hasdera-frontend/src/components/AdminFlipbookViewer.jsx#L1280)
- **Implementation**: Use `finalPdfUrl = ${apiBaseUrl}/api/issues/${issue.IssueId}/pdf` for S3 URLs

## �🚀 AI Agent Quick-Start

To be productive immediately:
1. **Understand Authentication**: Review `AuthContext.jsx` and `Program.cs` (lines 1-100)
2. **Trace an API Call**: Pick a feature (e.g., issue creation) → follow Controller → Service → DB
3. **Check Role-Based Access**: ProtectedRoute components + `[Authorize]` attributes define boundaries
4. **Verify S3 Upload Flow**: `UploadPdf` endpoint shows the pattern for file handling
5. **Test Locally**: Run `npm run dev` + `dotnet run` → navigate to a protected route
