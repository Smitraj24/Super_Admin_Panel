// Sidebar menu definitions for each department (USER role)
export const userDeptMenus = {
  it: [
    "Dashboard",
    "Profile",
    "Users",
    "Departments",
    "Roles",
    "Help Desk",
    "Network Monitor",
  ],
  ce: [
    "Dashboard",
    "Profile",
    "Users",
    "Departments",
    "Roles",
    "Projects",
    "Reports",
  ],
  sales: [
    "Dashboard",
    "Profile",
    "Users",
    "Departments",
    "Roles",
    "Leads",
    "Targets",
    "Reports",
  ],
  hr: ["Dashboard", "Profile", "Users", "Departments", "Roles"],
};

// Default menu items for USER role
export const defaultUserMenu = [
  "Dashboard",
  "Profile",
  "Users",
  "Departments",
  "Roles",
];

// Get available menu items for a specific department and user role
export const getAvailableMenus = (department, role = "USER") => {
  if (role === "ADMIN") {
    const adminDeptMenus = {
      it: [
        "Dashboard",
        "Profile",
        "Users",
        "Departments",
        "Roles",
        "Holidays",
        "Help Desk",
        "Asset Management",
        "Network Monitor",
      ],
      ce: [
        "Dashboard",
        "Profile",
        "Users",
        "Departments",
        "Roles",
        "Holidays",
        "Projects",
        "Lab Equipment",
        "Reports",
      ],
      sales: [
        "Dashboard",
        "Profile",
        "Users",
        "Departments",
        "Roles",
        "Holidays",
        "Leads",
        "Targets",
        "Reports",
      ],
      hr: [
        "Dashboard",
        "Profile",
        "Admins",
        "Users",
        "Departments",
        "Roles",
        "Holidays",
      ],
    };
    return (
      adminDeptMenus[department?.toLowerCase()] || [
        "Dashboard",
        "Profile",
        "Users",
        "Departments",
        "Roles",
        "Holidays",
      ]
    );
  }

  return userDeptMenus[department?.toLowerCase()] || defaultUserMenu;
};
