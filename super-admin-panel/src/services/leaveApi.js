import axiosInstance from "@/utils/axiosInstance";

export const getLeavesApi = () => axiosInstance.get("/leaves");
export const getAllLeavesApi = () => axiosInstance.get("/leaves/all");
export const getUserLeavesApi = () => axiosInstance.get("/leaves/user/own");
export const getUserLeaveBalanceApi = () => axiosInstance.get("/leaves/user/balance");
export const applyLeaveApi = (data) =>
  axiosInstance.post("/leaves/apply", data);
export const updateLeaveStatusApi = (id, status) =>
  axiosInstance.put(`/leaves/${id}`, { status });
export const deleteUserLeaveApi = (id) =>
  axiosInstance.delete(`/leaves/user/${id}`);
export const updateUserLeaveApi = (id, data) =>
  axiosInstance.put(`/leaves/user/${id}`, data);

// SuperAdmin specific endpoints
export const getSuperAdminLeavesApi = () => axiosInstance.get("/superadmin/leaves");
export const updateSuperAdminLeaveStatusApi = (id, status) =>
  axiosInstance.put(`/superadmin/leaves/${id}`, { status });
