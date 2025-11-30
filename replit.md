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
✅ User authentication with JWT tokens and role selection  
✅ Kanban board with drag-and-drop (DnD via @hello-pangea/dnd)  
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

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
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

## Recent Fixes (Nov 30, 2025)

### Fixed Issues ✅
1. **Frontend-backend connection** - Updated Vite proxy to properly route to 127.0.0.1:8000
2. **Tailwind CSS v4** - Fixed by installing @tailwindcss/postcss and updating config
3. **Login endpoint** - Fixed to directly query users by email instead of relying on authenticate()
4. **Registration endpoint** - Added better error handling and validation
5. **User authentication** - Improved to use check_password() for secure verification

### Testing
A test user has been created:
- Email: `test@example.com`
- Password: `TestPassword123!`
- Role: `Scrum Master`

You can use this to test the application. Try "Sign in" → enter credentials → explore the dashboard!

## Troubleshooting
- **Port already in use**: Change port in vite.config.js or manage.py command
- **Database connection error**: Ensure DATABASE_URL environment variable is set
- **Module not found**: Run `npm install` in frontend or `pip install -r requirements.txt` in backend
- **CORS errors**: Ensure corsheaders is installed and configured in Django settings
- **Login fails**: Check that user email exists and password is correct
