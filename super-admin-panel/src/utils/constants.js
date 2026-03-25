export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
};

export const DEPARTMENTS = {
  IT: {
    name: "IT",
    path: "/dashboard/it",
    adminPath: "/admin/it",
    color: "from-blue-500 to-blue-600",
  },
  HR: {
    name: "HR",
    path: "/dashboard/hr",
    adminPath: "/admin/hr",
    color: "from-green-500 to-green-600",
  },
  SALES: {
    name: "SALES",
    path: "/dashboard/sales",
    adminPath: "/admin/sales",
    color: "from-purple-500 to-purple-600",
  },
  FINANCE: {
    name: "FINANCE",
    path: "/dashboard/finance",
    adminPath: "/admin/finance",
    color: "from-yellow-500 to-yellow-600",
  },
  CE: {
    name: "CE",
    path: "/dashboard/ce",
    adminPath: "/admin/ce",
    color: "from-orange-500 to-orange-600",
  },
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
