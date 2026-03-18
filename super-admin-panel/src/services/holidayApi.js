import API from "@/lib/api";

export const getHolidaysApi = () => API.get("/holidays");

export const addHolidayApi = (data) => API.post("/holidays", data);

export const updateHolidayApi = (id, data) => API.put(`/holidays/${id}`, data);

export const deleteHolidayApi = (id) => API.delete(`/holidays/${id}`);
