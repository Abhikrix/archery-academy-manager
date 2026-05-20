export const ROLES = {
  ADMIN: "admin",
  COACH: "coach",
  STUDENT: "student",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.COACH]: "Coach",
  [ROLES.STUDENT]: "Student",
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canAccessDashboard: true,
    canViewStudents: true,
    canManageStudents: true,
    canDeleteStudents: true,
    canManageAttendance: true,
    canManageFees: true,
    canViewReports: true,
    canManageUsers: true,
    canAccessSettings: true,
  },
  [ROLES.COACH]: {
    canAccessDashboard: false,
    canViewStudents: true,
    canManageStudents: false,
    canDeleteStudents: false,
    canManageAttendance: true,
    canManageFees: true,
    canViewReports: true,
    canManageUsers: false,
    canAccessSettings: false,
  },
  [ROLES.STUDENT]: {
    canAccessDashboard: false,
    canViewStudents: false,
    canManageStudents: false,
    canDeleteStudents: false,
    canManageAttendance: false,
    canManageFees: false,
    canViewReports: false,
    canManageUsers: false,
    canAccessSettings: false,
  },
};
