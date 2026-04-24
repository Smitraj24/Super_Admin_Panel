# Super Admin Leave Management Feature

## Overview
Added comprehensive leave management functionality for Super Admin with dedicated API endpoints and UI.

## Backend Changes

### 1. Leave Controller (`Backend/controllers/leaveController.js`)
Added two new functions:
- `getAllLeavesForSuperAdmin()` - Fetches all leave requests across all departments with populated user and department data
- `updateLeaveStatusBySuperAdmin()` - Allows super admin to approve/reject leave requests without department restrictions

### 2. Super Admin Routes (`Backend/routes/superAdminRoutes.js`)
Added new routes:
- `GET /api/superadmin/leaves` - Get all leave requests
- `PUT /api/superadmin/leaves/:id` - Update leave status (approve/reject)

## Frontend Changes

### 1. Leave API Service (`super-admin-panel/src/services/leaveApi.js`)
Added new API functions:
- `getSuperAdminLeavesApi()` - Calls `/api/superadmin/leaves`
- `updateSuperAdminLeaveStatusApi(id, status)` - Calls `/api/superadmin/leaves/:id`

### 2. Super Admin Leaves Page (`super-admin-panel/src/app/superadmin/leaves/page.js`)
Updated to use super admin specific endpoints:
- Changed from `getAllLeavesApi()` to `getSuperAdminLeavesApi()`
- Changed from `updateLeaveStatusApi()` to `updateSuperAdminLeaveStatusApi()`
- Fixed field references from `userId` to `user` to match backend model

### 3. Sidebar Component (`super-admin-panel/src/components/Sidebar.js`)
Added "Leaves" menu item for Super Admin:
- Path: `/superadmin/leaves`
- Icon: ClipboardList
- Positioned between Attendance and Holidays

## Features

### Leave Management Dashboard
- View all leave requests from all users across all departments
- Filter by:
  - User name/email (search)
  - Leave status (PENDING, APPROVED, REJECTED)
  - Specific user
- Statistics cards showing:
  - Total leaves
  - Pending leaves
  - Approved leaves
  - Rejected leaves

### Leave Actions
- Approve pending leave requests
- Reject pending leave requests 
- View leave details (type, duration, dates, reason)

### Reporting
- Download CSV report with all filtered leave data
- Includes: Name, Email, Department, Leave Type, Dates, Duration, Reason, Status

## Access Control
- Only users with SUPER_ADMIN role can access these endpoints
- Protected by `authMiddleware` and `roleMiddleware(["SUPER_ADMIN"])`

## Navigation
Super Admin can now access Leave Management from:
- Sidebar menu: "Leaves"
- Direct URL: `/superadmin/leaves`
