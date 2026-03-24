"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { User, Mail, Building2, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function SALESProfilePage() {
  const { user } = useAuth();

  return (
    <main>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-900 mb-8">
            My Profile - SALES Department
          </h1>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">
                    {user?.name}
                  </h2>
                  <p className="text-purple-600">SALES Department</p>
                </div>
              </div>

              <hr className="border-purple-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-purple-900">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Building2 className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="text-lg font-semibold text-purple-900">
                      {typeof user?.department === "object"
                        ? user?.department?.name
                        : user?.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Shield className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-lg font-semibold text-purple-900">
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

export default SALESProfilePage;
