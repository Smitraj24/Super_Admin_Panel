"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CELeave() {
  // Redirect to HR admin apply-leave page since they share the same functionality
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/hr/apply-leave");
  }, [router]);

  return (
    <div className="p-6">
      <p>Redirecting to leave management...</p>
    </div>
  );
}
