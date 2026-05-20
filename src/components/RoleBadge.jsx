import * as React from "react";
import { ROLE_LABELS, ROLES } from "../constants/roles";

const roleClasses = {
  [ROLES.ADMIN]: "border-academy-gold/50 bg-academy-gold/15 text-academy-gold",
  [ROLES.COACH]: "border-sky-300/40 bg-sky-300/10 text-sky-200",
  [ROLES.STUDENT]: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
};

export default function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-medium uppercase tracking-[0.14em] ${
        roleClasses[role] || "border-white/10 bg-white/[0.04] text-neutral-300"
      }`}
    >
      {ROLE_LABELS[role] || "Unknown"}
    </span>
  );
}
