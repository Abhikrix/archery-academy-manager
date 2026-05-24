import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import AttendanceButtonGroup from "./AttendanceButtonGroup";
import FeeStatusBadge from "./FeeStatusBadge";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function StudentCard({
  student,
  batch,
  canManageAttendance,
  canManageStudents,
  onAttendanceChange,
  onEdit,
  onDelete,
}) {
  return (
    <article className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{student.id}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{student.name}</h3>
          <p className="mt-1 text-sm text-neutral-400">{batch?.name}</p>
        </div>
        <FeeStatusBadge status={student.feeStatus} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-neutral-500">Parent name</dt>
          <dd className="mt-1 text-white">{student.parentName || "Not added"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Parent phone</dt>
          <dd className="mt-1 text-white">{student.parentPhoneNumber || "Not added"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Student phone</dt>
          <dd className="mt-1 text-white">{student.studentPhoneNumber || "Not added"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Date of birth</dt>
          <dd className="mt-1 text-white">
            {formatDate(student.dateOfBirth || student.joinDate)}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Monthly fee</dt>
          <dd className="mt-1 text-white">{formatCurrency(student.feeAmount)}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Fee status</dt>
          <dd className="mt-1 capitalize text-white">{student.feeStatus}</dd>
        </div>
      </dl>

      {canManageAttendance && (
        <div className="mt-4">
          <AttendanceButtonGroup
            status={student.attendanceStatus}
            onChange={(status) => onAttendanceChange(student.id, status)}
          />
        </div>
      )}

      {canManageStudents && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button type="button" className="ghost-button flex-1" onClick={() => onEdit(student)}>
            <Pencil size={16} />
            Edit
          </button>
          <button
            type="button"
            className="ghost-button flex-1 text-rose-200 hover:border-rose-400/60 hover:text-rose-100"
            onClick={() => onDelete(student.id)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
