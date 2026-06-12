import { Check, Clock, AlertCircle, Bell } from "lucide-react";

export const ROLE_MAP = { SUPER_ADMIN: "superadmin", ADMIN: "admin", USER: "user" };
export const DEPT_MAP = { EMPLOYEE: "employee", SALES: "sales", HR: "hr" };
export const ICON_MAP = {
  success: <Check size={13} className="text-emerald-400" />,
  warning: <Clock size={13} className="text-amber-400" />,
  alert: <AlertCircle size={13} className="text-rose-400" />,
  default: <Bell size={13} className="text-[#7c6fff]" />,
};
export const NOTIF_TTL = 60_000;
export const NOTIF_CACHE_KEY = "notifications";