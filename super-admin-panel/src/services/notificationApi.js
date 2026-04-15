import API from "@/lib/api";

// Get all notifications
export const getNotificationsApi = (limit = 20, skip = 0) => 
  API.get(`/notifications?limit=${limit}&skip=${skip}`);

// Get unread count
export const getUnreadCountApi = () => 
  API.get("/notifications/unread-count");

// Mark notification as read
export const markAsReadApi = (id) => 
  API.put(`/notifications/${id}/read`);

// Mark all as read
export const markAllAsReadApi = () => 
  API.put("/notifications/read-all");

// Delete notification
export const deleteNotificationApi = (id) => 
  API.delete(`/notifications/${id}`);

// Create notification (admin use)
export const createNotificationApi = (data) => 
  API.post("/notifications", data);

// Broadcast message to department (admin only)
export const broadcastToDepartmentApi = (data) => 
  API.post("/notifications/broadcast", data);

// Broadcast message to all users or specific department (super admin only)
export const broadcastToAllApi = (data) => 
  API.post("/notifications/broadcast-all", data);
