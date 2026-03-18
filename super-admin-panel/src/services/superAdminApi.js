import axiosInstance from "../utils/axiosInstance";

export const getStatsApi = () => axiosInstance.get("/superadmin/stats");

export const getDepartmentsApi = () => axiosInstance.get("/superadmin/departments");
export const createDepartmentApi = (data) => axiosInstance.post("/superadmin/departments", data);
export const updateDepartmentApi = (id, data) => axiosInstance.put(`/superadmin/departments/${id}`, data);
export const deleteDepartmentApi = (id) => axiosInstance.delete(`/superadmin/departments/${id}`);

export const getRolesApi = () => axiosInstance.get("/superadmin/roles");
export const createRoleApi = (data) => axiosInstance.post("/superadmin/roles", data);
export const updateRoleApi = (id, data) => axiosInstance.put(`/superadmin/roles/${id}`, data);
export const deleteRoleApi = (id) => axiosInstance.delete(`/superadmin/roles/${id}`);
