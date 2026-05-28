"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function CEAdminLeave() {
  // Redirect to HR admin apply-leave page since they share the same functionality
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/hr/apply-leave");
  }, [router]);

  return (
    <main className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <div className="lg:ml-64 pt-20 flex-1">
        <div className="p-6">
          <p>Redirecting to leave management...</p>
        </div>
      </div>
    </main>
  );
}
