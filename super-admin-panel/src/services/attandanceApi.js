import API from "@/lib/api";

export const getAttendanceApi = (date) => API.get(`/attendance?date=${date}`);

export const checkInApi = (data) => API.post("/attendance/check-in", data);
export const breakInApi = (data) => API.post("/attendance/break-in", data);
export const breakOutApi = (data) => API.post("/attendance/break-out", data);
export const checkOutApi = (data) => API.post("/attendance/check-out", data);

export const getTodayStatusApi = () => API.get("/attendance/status");
