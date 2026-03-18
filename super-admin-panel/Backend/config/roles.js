import { PERMISSIONS } from "./permissions.js";

export const DEFAULT_ROLES = [
  {
    name: "SUPER_ADMIN",
    description: "Full system access",
    permissions: Object.values(PERMISSIONS),
    isSystemRole: true,
  },
  {
    name: "ADMIN",
    description: "Department level admin",
    permissions: [
      PERMISSIONS.CREATE_USER,
      PERMISSIONS.UPDATE_USER,
      PERMISSIONS.DELETE_USER,
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.VIEW_DEPARTMENTS,
    ],
    isSystemRole: true,
  },
  {
    name: "HR_MANAGER",
    description: "HR role",
    permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.UPDATE_USER],
    isSystemRole: false,
  },
  {
    name: "PROJECT_MANAGER",
    description: "Project manager role",
    permissions: [
      PERMISSIONS.CREATE_PROJECT,
      PERMISSIONS.UPDATE_PROJECT,
      PERMISSIONS.VIEW_PROJECTS,
    ],
    isSystemRole: false,
  },
  {
    name: "DEVELOPER",
    description: "Developer role",
    permissions: [PERMISSIONS.VIEW_PROJECTS, PERMISSIONS.UPDATE_PROJECT],
    isSystemRole: false,
  },
  {
    name: "INTERN",
    description: "Read only access",
    permissions: [PERMISSIONS.VIEW_PROJECTS, PERMISSIONS.VIEW_USERS],
    isSystemRole: false,
  },
];

