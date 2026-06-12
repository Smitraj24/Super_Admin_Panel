import SuperAdminGuard from "@/components/auth/UserGuard";

export default function SuperAdminLayout({ children }) {
  return <SuperAdminGuard>{children}</SuperAdminGuard>;
}
