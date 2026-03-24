"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Shield } from "lucide-react";
import { useState, useEffect } from "react";

function SALESRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/superadmin/roles", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setRoles(data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <main>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-900 mb-8">
            System Roles
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-purple-600">Loading roles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-purple-900">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        {role.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {role.permissions?.slice(0, 3).map((perm, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded"
                          >
                            {perm}
                          </span>
                        ))}
                        {role.permissions?.length > 3 && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SALESRolesPage;
