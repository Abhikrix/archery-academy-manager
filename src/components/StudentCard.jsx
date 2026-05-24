import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import AttendanceButtonGroup from "./AttendanceButtonGroup";
import FeeStatusBadge from "./FeeStatusBadge";
import { formatCurrency, formatDate } from "../utils/formatters";

function getVisibleStudentId(student) {
  const studentId = String(student.studentId || "").trim();
  const documentId = String(student.id || "").trim();

  if (studentId && studentId !== documentId) {
    return studentId;
  }

  if (/^(ST|ARC)-/i.test(documentId) || documentId.length <= 12) {
    return documentId;
  }

  return "Student ID not added";
}

export default function StudentCard({
  student,
  batch,
  canManageAttendance,
  canManageStudents,
  onAttendanceChange,
  onEdit,
  onDelete,
}) {
  const visibleStudentId = getVisibleStudentId(student);

  return (
    <article className="surface min-w-0 overflow-hidden p-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words text-xs uppercase tracking-[0.18em] text-neutral-500">
            {visibleStudentId}
          </p>
          <h3 className="mt-2 break-words text-lg font-semibold text-white">{student.name}</h3>
          <p className="mt-1 break-words text-sm text-neutral-400">{batch?.name}</p>
        </div>
        <div className="flex max-w-full shrink-0 justify-end">
          <FeeStatusBadge status={student.feeStatus} />
        </div>
      </div>

      <dl className="mt-4 grid min-w-0 gap-3 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-neutral-500">Parent name</dt>
          <dd className="mt-1 break-words text-white">{student.parentName || "Not added"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-neutral-500">Parent phone</dt>
          <dd className="mt-1 break-words text-white">
            {student.parentPhoneNumber || "Not added"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-neutral-500">Student phone</dt>
          <dd className="mt-1 break-words text-white">
            {student.studentPhoneNumber || "Not added"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-neutral-500">Date of birth</dt>
          <dd className="mt-1 break-words text-white">
            {formatDate(student.dateOfBirth || student.joinDate)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-neutral-500">Monthly fee</dt>
          <dd className="mt-1 break-words text-white">{formatCurrency(student.feeAmount)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-neutral-500">Fee status</dt>
          <dd className="mt-1 break-words capitalize text-white">{student.feeStatus}</dd>
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
