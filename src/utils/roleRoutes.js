import { ROLES } from "../constants/roles";

export const ROLE_HOME_PATHS = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.COACH]: "/coach/attendance",
  [ROLES.STUDENT]: "/student/overview",
};

export function getRoleHomePath(role) {
  return ROLE_HOME_PATHS[role] || "/login";
}
