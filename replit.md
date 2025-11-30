# TaskFlow - Jira-like Project Management Application

## Overview
TaskFlow is a comprehensive project management application inspired by Jira, featuring behavioral analytics, sprint management, and team collaboration tools. Built with a React frontend and Django backend.

## Tech Stack
- **Frontend**: React 18 + Vite, Tailwind CSS, React Router DOM, Lucide React Icons, Chart.js, date-fns
- **Backend**: Django 4.2, Django REST Framework, JWT Authentication (djangorestframework-simplejwt)
- **Database**: PostgreSQL (Neon-backed)
- **Authentication**: JWT tokens with role-based access control

## User Roles
1. **Scrum Master**: Full access to create/manage projects, sprints, tasks, and team members
2. **Employee**: View assigned tasks, update task status, track time

## Key Features
- Kanban board with drag-and-drop
- Sprint management and backlog planning
- Calendar view for task deadlines
- Analytics dashboard with productivity metrics
- Time tracking
- Team management
- Behavioral event tracking for AI insights

## Project Structure
```
/backend
  /api          - API models, views, serializers
  /taskflow     - Django settings
  manage.py     - Django management script

/frontend
  /src
    /components - Reusable UI components (Sidebar, Header)
    /context    - React Context (AuthContext)
    /pages      - Page components (Dashboard, KanbanBoard, etc.)
    /services   - API service layer
    App.jsx     - Main application component
    main.jsx    - Entry point
```

## Running the Application
- **Backend**: `cd backend && python manage.py runserver 0.0.0.0:8000`
- **Frontend**: `cd frontend && npm run dev`

## API Endpoints
- `/api/auth/register/` - User registration
- `/api/auth/login/` - JWT token login
- `/api/auth/me/` - Get current user
- `/api/projects/` - CRUD operations for projects
- `/api/sprints/` - Sprint management
- `/api/tasks/` - Task management
- `/api/time-entries/` - Time tracking
- `/api/analytics/` - Analytics data
- `/api/behavioral-events/` - Event tracking

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Django secret key

## Recent Changes
- Initial setup of Django backend with all models and API endpoints
- React frontend with Tailwind CSS v4 configuration
- JWT authentication with role-based access control
- All main pages created: Login, Dashboard, Kanban, Calendar, Projects, Analytics, TimeTracking, Team, Settings
