# Leave Balance System Implementation

## Overview
Implemented a comprehensive leave balance tracking system with monthly limits for leave applications. The system now displays leave balances on the frontend when users log in and navigate to the leave routes.

## Features Added

### 1. User Model Updates
Added the following fields to the User schema:
- `joiningDate`: Date when the user joined
- `probationEndDate`: Date when probation period ends
- `leaveBalance`: Object containing leave balances for different types
  - `PL`: Privilege Leave (default: 0)
  - `CL`: Casual Leave (default: 0)
  - `SL`: Sick Leave (default: 0)
  - `DL`: Duty Leave (default: 0)

### 2. Leave Application Validations

#### Balance Validation
- System checks if user has sufficient leave balance before allowing application
- Returns error message showing available balance vs required days
- Calculates leave days including half-day support (0.5 days)

#### Monthly Limits
- **PL (Privilege Leave)**: Maximum 2 applications per month
- **SL (Sick Leave)**: Maximum 2 applications per month
- System counts pending and approved leaves in the current month
- Returns error if monthly limit is exceeded

### 3. Leave Approval/Rejection Logic

#### On Approval
- Deducts leave days from user's balance
- Prevents approval if insufficient balance
- Calculates days based on date range and half-day flag

#### On Rejection
- Restores leave balance if previously approved leave is rejected
- Ensures balance consistency

### 4. Frontend Integration

#### Leave Balance Display
- Added colorful balance cards showing PL, CL, SL, and DL balances
- Cards display current balance and monthly usage status
- Real-time updates after leave application or approval
- Visual indicators:
  - ✓ Shows usage count (e.g., "✓ 1/2 used this month")
  - ❌ Shows "Monthly limit reached" when 2 leaves applied

#### Leave Type Selection with Smart Disabling
- Dropdown now shows leave type with current balance
- Example: "Privilege Leave (PL) - Balance: 10 (1/2 this month)"
- **PL and SL options are automatically disabled** when user has applied 2 leaves of that type in current month
- Disabled options show "(Monthly limit reached)" message
- Helps users make informed decisions before applying
- Prevents form submission errors

#### Components Updated
- `LeaveManagement.js` - CE Admin leave page
- `admin/hr/apply-leave/page.js` - HR Admin leave page
- Both now fetch and display leave balance with monthly usage on page load

### 5. New API Endpoints

#### Get User Leave Balance
```
GET /api/leaves/user/balance
```
Returns:
- Leave balance for all types (PL, CL, SL, DL)
- Joining date
- Probation end date

### 6. User Management Updates

#### Create User/Admin
- Accepts optional `joiningDate`, `probationEndDate`, and `leaveBalance` in request body
- Defaults to current date for joining date if not provided
- Initializes leave balance to {PL: 0, CL: 0, SL: 0, DL: 0} if not provided

#### Update User/Admin
- Allows updating `joiningDate`, `probationEndDate`, and `leaveBalance`
- Only updates fields that are provided in request

## API Usage Examples

### Apply Leave with Validation
```javascript
POST /api/leaves/apply
{
  "leaveType": "PL",
  "fromDate": "2026-05-01",
  "toDate": "2026-05-03",
  "reason": "Personal work",
  "isHalfDay": false
}
```

Response (if monthly limit exceeded):
```javascript
{
  "message": "Maximum 2 PL applications allowed per month. You have already applied 2 times this month."
}
```

Response (if insufficient balance):
```javascript
{
  "message": "Insufficient PL balance. Available: 5, Required: 3"
}
```

### Get Leave Balance with Monthly Usage
```javascript
GET /api/leaves/user/balance

Response:
{
  "success": true,
  "data": {
    "leaveBalance": {
      "PL": 10,
      "CL": 8,
      "SL": 6,
      "DL": 5
    },
    "joiningDate": "2025-01-15",
    "probationEndDate": "2025-07-15",
    "monthlyUsage": {
      "PL": 1,
      "SL": 0
    }
  }
}
```

### Create User with Leave Balance
```javascript
POST /api/superadmin/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "departmentId",
  "joiningDate": "2026-01-01",
  "probationEndDate": "2026-07-01",
  "leaveBalance": {
    "PL": 12,
    "CL": 10,
    "SL": 8,
    "DL": 6
  }
}
```

### Update User Leave Balance
```javascript
PUT /api/superadmin/users/:id
{
  "leaveBalance": {
    "PL": 15,
    "CL": 12,
    "SL": 10,
    "DL": 8
  }
}
```

## Files Modified

### Backend
1. **Backend/models/User.models.js**
   - Added joiningDate, probationEndDate, and leaveBalance fields

2. **Backend/controllers/leaveController.js**
   - Updated `applyLeave` with balance and monthly limit validation
   - Updated `updateLeaveStatus` to deduct/restore balance
   - Updated `updateLeaveStatusBySuperAdmin` to deduct/restore balance
   - Updated `getUserLeaveBalance` to include monthly usage counts for PL and SL
   - Returns current month's leave application counts

3. **Backend/routes/leaveRoutes.js**
   - Added GET `/user/balance` route

4. **Backend/controllers/superAdminController.js**
   - Updated `createAdmin`, `updateAdmin`, `createUser`, `updateUser` to handle new fields

5. **Backend/services/userService.js**
   - Updated `createUser` to accept and initialize new fields

### Frontend
6. **super-admin-panel/src/services/leaveApi.js**
   - Added `getUserLeaveBalanceApi` function

7. **super-admin-panel/src/components/LeaveManagement.js**
   - Added leave balance state and fetch function
   - Added colorful balance cards display with monthly usage
   - Updated leave type dropdown to show balances and monthly usage
   - **Implemented auto-disable for PL/SL when monthly limit reached**
   - Refreshes balance after leave application

8. **super-admin-panel/src/app/admin/hr/apply-leave/page.js**
   - Added leave balance state and fetch function
   - Added colorful balance cards display with monthly usage
   - Updated leave type dropdown to show balances and monthly usage
   - **Implemented auto-disable for PL/SL when monthly limit reached**
   - Refreshes balance after leave application

## Business Rules

1. **Leave Balance Check**: Users cannot apply for leave if they don't have sufficient balance
2. **Monthly Limits**: PL and SL are limited to 2 applications per month (regardless of days)
3. **Balance Deduction**: Balance is deducted only when leave is approved
4. **Balance Restoration**: Balance is restored if an approved leave is rejected
5. **Half-Day Support**: Half-day leaves count as 0.5 days
6. **Default Values**: New users get 0 balance for all leave types unless specified
7. **Real-time Display**: Leave balances are displayed prominently on leave pages for both users and admins

## UI Features

### Leave Balance Cards
- **Blue Card**: Privilege Leave (PL) with monthly usage indicator
  - Shows "✓ X/2 used this month" or "❌ Monthly limit reached"
- **Green Card**: Casual Leave (CL) with "Available" note
- **Orange Card**: Sick Leave (SL) with monthly usage indicator
  - Shows "✓ X/2 used this month" or "❌ Monthly limit reached"
- **Purple Card**: Duty Leave (DL) with "Available" note

### Smart Leave Selection with Auto-Disable
- Dropdown shows current balance for each leave type
- Shows monthly usage for PL and SL (e.g., "1/2 this month")
- **Automatically disables PL option** when user has 2 PL leaves in current month
- **Automatically disables SL option** when user has 2 SL leaves in current month
- Disabled options show "(Monthly limit reached)" message
- Users cannot select disabled options, preventing errors
- CL and DL options are never disabled (no monthly limits)

## Notes

- The system tracks both PENDING and APPROVED leaves when counting monthly applications
- Leave balance is stored per user and can be managed by Super Admin
- Joining date and probation end date are optional fields for tracking purposes
- The monthly limit check is based on the `fromDate` of the leave application
- Frontend automatically refreshes balance after successful leave application
- Balance cards are responsive and work on mobile devices
- **PL and SL dropdown options are automatically disabled when monthly limit (2) is reached**
- Monthly usage resets at the beginning of each calendar month
- Disabled options cannot be selected, providing clear UX feedback
