"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Building2, Shield } from "lucide-react";

function ITProfilePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <Sidebar />
      <Navbar />
      <div className="lg:ml-64 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">
            My Profile - IT Department
          </h1>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">
                    {user?.name}
                  </h2>
                  <p className="text-blue-600">IT Department</p>
                </div>
              </div>

              <hr className="border-blue-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Building2 className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {typeof user?.department === "object"
                        ? user?.department?.name
                        : user?.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Shield className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {typeof user?.role === "object"
                        ? user?.role?.name
                        : user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ITProfilePage;
