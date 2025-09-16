# Dojo Management App - MVP Plan

## Core Features to Implement:
1. **Authentication System** - Login/Register with role selection (Profesor/Estudiante)
2. **Dashboard** - Different views based on user role
3. **Member Management** (Profesor only) - CRUD operations for student profiles
4. **Attendance Tracking** (Profesor only) - Mark attendance for classes
5. **Notifications System** - Send and view notifications
6. **Profile Management** - View and edit own profile

## Files to Create/Modify:

### Core Files:
- `src/pages/Index.tsx` - Landing/Login page
- `src/pages/Dashboard.tsx` - Main dashboard (role-based)
- `src/pages/Login.tsx` - Authentication page
- `src/components/AuthProvider.tsx` - Authentication context
- `src/types/index.ts` - TypeScript interfaces

### Professor Features:
- `src/pages/MemberManagement.tsx` - CRUD for students
- `src/pages/AttendanceTracking.tsx` - Mark attendance
- `src/pages/Notifications.tsx` - Send notifications
- `src/components/MemberCard.tsx` - Student profile card
- `src/components/AttendanceSheet.tsx` - Attendance form

### Student Features:
- `src/pages/StudentProfile.tsx` - View own profile
- `src/pages/StudentNotifications.tsx` - View notifications

### Shared Components:
- `src/components/Navigation.tsx` - Role-based navigation
- `src/components/Layout.tsx` - App layout wrapper

## Data Structure (localStorage for MVP):
- Users: { id, name, email, role, photo, belt, joinDate }
- Attendance: { studentId, date, present, classType }
- Notifications: { id, title, message, date, targetRole }

## Implementation Priority:
1. Authentication & routing
2. Basic dashboard structure
3. Member management (professor)
4. Attendance tracking
5. Notifications system
6. Profile management