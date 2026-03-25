import axiosInstance from "@/utils/axiosInstance";

export const getLeavesApi = () => axiosInstance.get("/leaves");
export const getUserLeavesApi = () => axiosInstance.get("/leaves/user/own");
export const applyLeaveApi = (data) =>
  axiosInstance.post("/leaves/apply", data);
export const updateLeaveStatusApi = (id, status) =>
  axiosInstance.put(`/leaves/${id}`, { status });
