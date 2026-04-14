# Department Admin & Super Admin Broadcast Message Feature

## Overview
- **Department Admins** can send broadcast messages to all users and admins within their department
- **Super Admins** can send broadcast messages to all users across all departments OR target a specific department
- Messages appear as notifications in the notification bell

## Features Implemented

### Backend (Node.js/Express)

1. **Controller Functions** (`Backend/controllers/notificationController.js`)
   - `broadcastToDepartment()` - Allows admins to send messages to their department members
   - `broadcastToAll()` - Allows super admins to send messages to all users or specific department
   - Validates roles and departments
   - Creates notifications for all targeted users
   - Returns recipient count

2. **API Routes** (`Backend/routes/notificationRoutes.js`)
   - `POST /api/notifications/broadcast` - Department admin broadcast (Admin only)
   - `POST /api/notifications/broadcast-all` - Super admin broadcast (Super Admin only)
   - Both require authentication (authMiddleware)

### Frontend (Next.js/React)

1. **Components**
   - `BroadcastMessage.js` - For department admins (targets their department only)
   - `SuperAdminBroadcast.js` - For super admins (targets all users or specific department)
   - Modal-based UI with real-time validation
   - Success feedback with auto-close

2. **Updated API Service** (`super-admin-panel/src/services/notificationApi.js`)
   - Added `broadcastToDepartmentApi()` - Admin broadcast
   - Added `broadcastToAllApi()` - Super admin broadcast

3. **Updated Dashboards**
   - **Admin Dashboards:** CE, HR, IT, Sales (`/admin/{department}`)
   - **Super Admin Dashboard:** (`/superadmin/dashboard`)
   - Each includes appropriate broadcast button

## How It Works

### Department Admin Flow:
1. Admin clicks "Broadcast Message" button on their dashboard
2. Fills in title, message, and selects message type
3. Message is sent to all active users in their department
4. Notification title includes admin's name: `[Admin Name] Title`

### Super Admin Flow:
1. Super Admin clicks "Broadcast Message" button on dashboard
2. Selects target: "All Users" or specific department
3. Fills in title, message, and selects message type
4. Message is sent to all targeted users
5. Notification title includes: `[Super Admin] Title`

### Users Receive:
- Notification appears in the bell icon (top-right navbar)
- Unread count badge updates automatically
- Users can mark as read or delete
- Auto-refresh every 30 seconds

## API Endpoints

### POST /api/notifications/broadcast (Admin Only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Important Update",
  "message": "Please review the new policy document",
  "type": "info"
}
```

**Response:**
```json
{
  "message": "Message broadcasted successfully",
  "recipientCount": 15
}
```

### POST /api/notifications/broadcast-all (Super Admin Only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (All Users):**
```json
{
  "title": "System Maintenance",
  "message": "System will be down for maintenance on Sunday",
  "type": "warning"
}
```

**Request Body (Specific Department):**
```json
{
  "title": "Department Update",
  "message": "New policy for HR department",
  "type": "info",
  "targetDepartment": "60d5ec49f1b2c72b8c8e4f1a"
}
```

**Response:**
```json
{
  "message": "Message broadcasted to all users successfully",
  "recipientCount": 150
}
```

## Message Types

- `info` - Blue icon (default)
- `success` - Green checkmark icon
- `warning` - Yellow clock icon
- `alert` - Red alert icon

## Testing

### Test as Department Admin:
1. Login with ADMIN role (e.g., HR Admin)
2. Navigate to `/admin/hr`
3. Click "Broadcast Message" button
4. Send a test message
5. Login as users in HR department to verify notifications

### Test as Super Admin:
1. Login with SUPER_ADMIN role
2. Navigate to `/superadmin/dashboard`
3. Click "Broadcast Message" button
4. Test both options:
   - Send to "All Users"
   - Send to specific department
5. Login as various users to verify notifications

## Security

- **Admin Broadcast:**
  - Only ADMIN role can access
  - Messages scoped to admin's department only
  - Cannot target other departments

- **Super Admin Broadcast:**
  - Only SUPER_ADMIN role can access
  - Can target all users or specific departments
  - Full system-wide messaging capability

- **General:**
  - Authentication required via JWT token
  - Input validation on frontend and backend
  - Only active users receive notifications

## Features

### Department Admin Component:
- Simple interface for department-scoped messages
- Message type selection (info/success/warning/alert)
- Real-time validation
- Success/error feedback
- Auto-close on success

### Super Admin Component:
- Department selector dropdown
- "All Users" option for system-wide messages
- Dynamic target label showing selected audience
- Fetches departments on modal open
- All features from admin component

## Auto-Refresh

- Notifications auto-refresh every 30 seconds
- Real-time unread count updates
- Optimistic UI updates for better UX
- No page reload required
