import axios from "@/utils/axiosInstance";

export const getUsers = () => axios.get("/users/users");

export const getProfile = () => axios.get("/users/profile");

export const uploadProfilePhotoApi = async (formData) => {
  const token = localStorage.getItem("token");

  const response = await axios.put("/users/profile/profile-photo", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateProfile = (data) => axios.put("/users/profile", data);

export const createUser = (data) => axios.post("/users", data);

export const deleteUser = (id) => axios.delete(`/users/${id}`);

export const getUpcomingBirthdays = () =>
  axios.get("/users/upcoming-birthdays");
