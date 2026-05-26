"use client";

export default function SalesAdminLeave() {
  // Redirect to HR admin apply-leave page since they share the same functionality
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/hr/apply-leave';
  }
  
  return (
    <div className="p-6">
      <p>Redirecting to leave management...</p>
    </div>
  );
}
