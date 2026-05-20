import * as React from "react";
import { Check, X } from "lucide-react";

export default function AttendanceButtonGroup({ status, onChange, disabled = false }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Attendance status">
      <button
        type="button"
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition ${
          status === "present"
            ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
            : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-emerald-400/50"
        }`}
        onClick={() => onChange("present")}
        disabled={disabled}
      >
        <Check size={16} />
        Present
      </button>
      <button
        type="button"
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition ${
          status === "absent"
            ? "border-rose-400/60 bg-rose-400/15 text-rose-200"
            : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-rose-400/50"
        }`}
        onClick={() => onChange("absent")}
        disabled={disabled}
      >
        <X size={16} />
        Absent
      </button>
    </div>
  );
}
