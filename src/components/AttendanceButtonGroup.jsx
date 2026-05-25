import * as React from "react";
import { Check, X } from "lucide-react";

export default function AttendanceButtonGroup({ status, onChange, disabled = false, compact = false }) {
  const buttonSize = compact ? "h-9 text-xs" : "h-10 text-sm";
  const iconSize = compact ? 14 : 16;

  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Attendance status">
      <button
        type="button"
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition ${buttonSize} ${
          status === "present"
            ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
            : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-emerald-400/50"
        }`}
        onClick={() => onChange("present")}
        disabled={disabled}
      >
        <Check size={iconSize} />
        Present
      </button>
      <button
        type="button"
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition ${buttonSize} ${
          status === "absent"
            ? "border-rose-400/60 bg-rose-400/15 text-rose-200"
            : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-rose-400/50"
        }`}
        onClick={() => onChange("absent")}
        disabled={disabled}
      >
        <X size={iconSize} />
        Absent
      </button>
    </div>
  );
}
