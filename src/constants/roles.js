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
    canManageEquipment: true,
    canManageAnnouncements: true,
    canViewReports: true,
    canViewAuditLogs: true,
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
    canManageEquipment: true,
    canManageAnnouncements: false,
    canViewReports: true,
    canViewAuditLogs: false,
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
    canManageEquipment: false,
    canManageAnnouncements: false,
    canViewReports: false,
    canViewAuditLogs: false,
    canManageUsers: false,
    canAccessSettings: false,
  },
};
