# TaskFlow - Jira-like Project Management Application

## Overview
TaskFlow is a comprehensive project management application inspired by Jira, featuring behavioral analytics, sprint management, and team collaboration tools. Built with a React frontend and Django backend.

## Tech Stack
- **Frontend**: React 18 + Vite, Tailwind CSS v4, React Router DOM, Lucide React Icons, Chart.js, date-fns, @hello-pangea/dnd for drag-and-drop
- **Backend**: Django 4.2, Django REST Framework, JWT Authentication (djangorestframework-simplejwt), django-cors-headers
- **Database**: PostgreSQL (Neon-backed via DATABASE_URL environment variable)
- **Authentication**: JWT tokens with role-based access control

## User Roles & Permissions
- **Scrum Master**: Full access to create/manage projects, sprints, tasks, and team members
- **Employee**: Limited access - view assigned tasks, update task status, track personal time

## Key Features Implemented
✅ **Authentication**: Beautiful redesigned login/register pages with gradient background, inline validation, and password visibility toggle
✅ User registration and login with any email address (works with any credentials)
✅ Kanban board with drag-and-drop functionality
✅ Sprint management and backlog planning  
✅ Calendar view for task deadlines  
✅ Analytics dashboard with productivity charts  
✅ Time tracking with timer functionality  
✅ Team management and performance metrics  
✅ Behavioral event tracking for analytics  
✅ Role-based access control on API endpoints

## Project Structure
```
/backend
  /api
    models.py           - All data models
    views.py            - DRF viewsets and API endpoints
    serializers.py      - Serializers for all models
    permissions.py      - Role-based permission classes
    urls.py             - API routing
  /taskflow
    settings.py         - Django configuration
    urls.py             - Main URL routing
  manage.py             - Django CLI

/frontend
  /src
    /components         - Reusable UI components (Sidebar, Header, etc.)
    /context            - React Context (AuthContext for state management)
    /pages              - Page components (Dashboard, KanbanBoard, Analytics, etc.)
    /services           - API service layer (axios with interceptors)
    App.jsx             - Main application routing
    main.jsx            - Entry point
  vite.config.js        - Vite dev server config with API proxy
  tailwind.config.js    - Tailwind CSS configuration
  postcss.config.js     - PostCSS with @tailwindcss/postcss v4
```

## Running the Application

**Both workflows are pre-configured and auto-start:**
- Backend: `cd backend && python manage.py runserver 0.0.0.0:8000`
- Frontend: `cd frontend && npm run dev`

The frontend is accessible at http://localhost:5000 and proxies API calls to http://127.0.0.1:8000

## Authentication & Getting Started

### Create Your First Account
1. Go to the login page (http://localhost:5000)
2. Click "Create one" to go to registration
3. Enter any email and password (minimum 8 characters)
4. Choose your role: **Scrum Master** (for full access) or **Employee**
5. Fill in your full name
6. Confirm password and click "Create Account"
7. You're logged in! Start exploring TaskFlow

### Or Use Test Account
- **Email**: `test@example.com`
- **Password**: `TestPassword123!`
- **Role**: Scrum Master

### Key Authentication Features
- ✅ Works with any email address
- ✅ Password visibility toggle with eye icon
- ✅ Inline validation for all fields
- ✅ Real-time error messages
- ✅ Smooth transitions between login/register modes
- ✅ Beautiful gradient background with soft shadows
- ✅ Mobile responsive design

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user with any email
- `POST /api/auth/login/` - Login with email and password
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/users/me/` - Get current user profile
- `PUT /api/users/me/` - Update user profile

### Projects
- `GET/POST /api/projects/` - List/create projects
- `GET/PUT/DELETE /api/projects/{id}/` - Manage individual projects
- `GET /api/projects/{id}/board/` - Get Kanban board state
- `GET /api/projects/{id}/backlog/` - Get backlog tasks
- `GET /api/projects/{id}/members/` - List project members
- `POST /api/projects/{id}/add_member/` - Add team member

### Sprints
- `GET/POST /api/sprints/` - List/create sprints
- `POST /api/sprints/{id}/start/` - Start a sprint
- `POST /api/sprints/{id}/complete/` - Complete a sprint

### Tasks
- `GET/POST /api/tasks/` - List/create tasks
- `GET/PUT/PATCH/DELETE /api/tasks/{id}/` - Manage tasks
- `POST /api/tasks/{id}/move/` - Update task status and order

### Time Tracking
- `GET/POST /api/time-entries/` - List/create time entries
- `POST /api/time-entries/{id}/stop/` - Stop active timer

### Analytics
- `GET /api/dashboard/stats/` - Dashboard statistics
- `GET /api/analytics/data/` - Analytics data with charts
- `GET /api/team/stats/` - Team performance metrics
- `POST /api/analytics/events/` - Log behavioral events

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured on Replit)
- `SESSION_SECRET` - Django secret key (auto-configured on Replit)

## Recent Changes (Nov 30, 2025)

### ✨ Layout & Spacing Fixes
- **Sidebar** expanded from w-48 to w-64 with proper fixed positioning (z-40)
- **Main content offset** properly aligned with ml-64 to prevent overlap/merging
- **Content padding** increased to p-8 for better component visibility
- **Header** enhanced with z-30 (sticky top) and improved styling
- **Navigation items** better spaced and readable
- **User profile section** styled with bg-gray-50 background card

### ✨ Team Page Enhancements
- **Add Member Modal** fully implemented with project selection and email input
- **Error handling** with alert component for failed member additions
- **Team members display** with individual performance stats cards
- **Member efficiency charts** with visual progress bars
- **Status indicators** showing active/inactive members
- **Empty state** with helpful messaging and Add Member button

### ✨ Major UI Redesign - Authentication Pages
- **Beautiful gradient background** with soft blur effects
- **Centered card layout** with shadow and border styling
- **Enhanced form fields** with icons and proper spacing
- **Real-time inline validation** with error messages and icons
- **Password visibility toggle** with eye icon
- **Separate register form** with full name and confirm password
- **Error state display** with alert styling
- **Made with Emergent badge** at the bottom
- **Fully responsive** design for all screen sizes

### ✅ Fixed Issues
1. **Authentication** - Works with ANY email/password combination, fixed serializer validation
2. **Frontend-backend connection** - Updated Vite proxy configuration
3. **Tailwind CSS v4** - Fixed @tailwindcss/postcss configuration
4. **Sidebar merging** - Fixed layout spacing and proper ml-64 offset
5. **Add Member functionality** - Fully implemented modal with form validation
6. **Registration endpoint** - Better validation and error handling
7. **Role-based permissions** - Scrum Master can create projects, Employees have read-only access

### 🎨 Design Improvements
- Consistent with dashboard styling (blue gradient button, soft shadows, rounded cards)
- Light theme with professional appearance
- Smooth transitions and hover effects
- Clear visual hierarchy
- Accessible form inputs with proper focus states
- Better spacing between all components

## Testing the Application

### Test Registration
1. Click "Create one" from login page
2. Enter: `newuser@example.com` (any email you want)
3. Enter password (min 8 characters)
4. Choose role and enter full name
5. Confirm password
6. Click "Create Account"
7. You're logged in with your new account!

### Test Full Features
1. **Dashboard**: View productivity stats and recent tasks
2. **Kanban Board**: Create tasks and drag them between columns
3. **Projects**: Create new projects and add team members
4. **Calendar**: View tasks by due date
5. **Analytics**: Check productivity trends
6. **Time Tracking**: Start timer and track work hours
7. **Team**: View team member performance
8. **Settings**: Update profile information

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in vite.config.js or Django manage.py |
| Database connection error | Ensure DATABASE_URL environment variable is set |
| Module not found | Run `npm install` (frontend) or install Python dependencies |
| CORS errors | Verify corsheaders is installed and configured |
| Login fails | Check email/password and ensure user exists |
| Registration validation errors | Ensure password is 8+ chars and matches confirmation |

## Demo Content

The test account has been used to create:
- Sample project with tasks
- Tasks across different statuses (To Do, In Progress, Review, Done)
- Activity logs and behavioral events
- Time tracking entries

---

**Made with Emergent** - TaskFlow is built with the Emergent development framework for rapid prototyping of sophisticated web applications.
