import axiosInstance from "../utils/axiosInstance";

export const getAdminStatsApi = () => axiosInstance.get("/admin/stats");

// Department APIs
export const getDepartmentsApi = () => axiosInstance.get("/admin/departments");
export const createDepartmentApi = (data) =>
  axiosInstance.post("/admin/departments", data);
export const updateDepartmentApi = (id, data) =>
  axiosInstance.put(`/admin/departments/${id}`, data);
export const deleteDepartmentApi = (id) =>
  axiosInstance.delete(`/admin/departments/${id}`);

// Role APIs
export const getRolesApi = () => axiosInstance.get("/admin/roles");
export const createRoleApi = (data) => axiosInstance.post("/admin/roles", data);
export const updateRoleApi = (id, data) =>
  axiosInstance.put(`/admin/roles/${id}`, data);
export const deleteRoleApi = (id) => axiosInstance.delete(`/admin/roles/${id}`);
