import API from "@/lib/api";

export const getAttendanceApi = (date) => API.get(`/attendance?date=${date}`);

export const checkInApi = (data) => API.post("/attendance/check-in", data);
export const breakInApi = (data) => API.post("/attendance/break-in", data);
export const breakOutApi = (data) => API.post("/attendance/break-out", data);
export const checkOutApi = (data) => API.post("/attendance/check-out", data);

// Fixed: Properly format dates for the API
export const getMonthlyAttendanceApi = (startDate, endDate) => {
  // If startDate and endDate are provided as date strings, use them directly
  if (startDate && endDate) {
    return API.get(`/attendance?startDate=${startDate}&endDate=${endDate}`);
  }
  // Otherwise, treat them as month/year (legacy support)
  return API.get(`/attendance?startDate=${startDate}&endDate=${endDate}`);
};

export const getTodayStatusApi = () => API.get("/attendance/status");
