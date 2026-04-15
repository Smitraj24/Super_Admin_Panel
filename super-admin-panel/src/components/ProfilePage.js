"use client";

import { useAuth } from "../context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { User, Mail, Shield, Settings, X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { updateProfile } from "@/services/userApi";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(true);
    setMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await updateProfile(formData);
      
      // Update the user context with new data
      const updatedUser = { ...user, ...formData };
      login({ token: localStorage.getItem("token"), user: updatedUser });
      
      setMessage("Profile updated successfully!");
      setMessageType("success");
      setIsEditing(false);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage(error.response?.data?.message || "Failed to update profile");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <main className="md:pl-64 pt-16 min-h-100vh flex items-center justify-center">
        <div className="w-full max-w-2xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              My Profile
            </h1>

            {!isEditing ? (
              <button
                onClick={handleEdit}
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto justify-center"
              >
                <Settings size={18} />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancel}
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition w-full sm:w-auto justify-center"
              >
                <X size={18} />
                Cancel
              </button>
            )}
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg font-semibold ${
                messageType === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className=" bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-x-auto ">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <User className="text-indigo-600" size={40} />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  {user?.name}
                </h2>
                <p className="text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit Information
                </h3>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
              <div className="p-6 border-b border-slate-200 ">
                <h3 className="text-lg font-semibold text-slate-900">
                  My Information
                </h3>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-green-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Email Address</p>
                    <p className="font-semibold text-slate-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="text-purple-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="font-semibold text-slate-900">
                      {user?.role?.name || user?.role || "User"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="text-orange-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-semibold text-slate-900">
                      {typeof user?.department === "object" 
                        ? user?.department?.name 
                        : user?.department || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
