# CHANGELOG - Gracie Barra Andradas

## [0.4.1] - 2026-01-20 15:41 BRT

### 🐛 Bug Fixes

- **CRITICAL**: Fixed post-login redirect issue where users remained on home page
  - Enhanced `LoginModal.tsx` redirect logic with 2-second timeout fallback
  - Users now properly redirect to `/aluno` (Student Area) or `/admin` (Admin Panel) based on role
  - Prevents indefinite waiting for profile data to load
  - Ensures reliable navigation even with slow network or database delays

---

## [0.3.0] - 2026-01-20 15:13 BRT

### 🔒 Security & Authentication

- **CRITICAL**: Fixed infinite loading state in AuthContext with 5-second timeout
- **CRITICAL**: Implemented Nuclear Logout protocol (complete storage wipe + hard redirect)
- Enhanced RLS policies for `student_attendance` and `student_graduations`
- Created/optimized `check_is_admin()` function with SECURITY DEFINER
- Added admin policies for graduation management

### 🐛 Bug Fixes

- Fixed 406 error in graduation fetch (removed `.single()` on empty results)
- Fixed user role assignment (<lewmosconi@gmail.com> corrected to student)
- Fixed logout button not responding (now always functional, red color)
- Fixed attendance display issues with comprehensive error logging
- Fixed Navbar loading state preventing premature navigation

### ✨ Features

- Real-time profile synchronization via Supabase channels
- Protected Routes with RBAC (Role-Based Access Control)
- Comprehensive error logging for debugging
- Emergency reset page at `/reset.html`

### 🔄 Data Migration

- Migrated user profiles from ARCHVERSO to APPS project
- Preserved 15 attendance records for <lewmosconi@gmail.com>
- Updated environment configuration to correct Supabase project

### 📝 Code Quality

- Added detailed console logging for attendance and graduation fetches
- Improved error handling with user-friendly notifications
- TypeScript fixes in debug scripts
- Cleaned up authentication flow

### 🗄️ Database

- Applied migration: `fix_rls_helper_functions`
- Applied migration: `fix_student_graduations_rls`
- Verified RLS policies on all critical tables

---

## [0.2.2] - Previous Version

(Legacy version before security overhaul)
