import AttendanceButtonGroup from "./AttendanceButtonGroup";
import StudentAvatar from "./StudentAvatar";
import { getVisibleStudentId } from "../utils/studentRecords";

export default function AttendanceStudentCard({ student, batch, onAttendanceChange }) {
  const visibleStudentId = getVisibleStudentId(student);
  const batchName = batch?.name || student?.batchName || student?.batch || "No batch";

  return (
    <article className="attendance-student-card surface min-w-0 overflow-hidden p-3">
      <div className="flex min-w-0 items-center gap-3">
        <StudentAvatar student={student} size="sm" />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-5 text-white">
            {student?.name || "Unnamed student"}
          </h3>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-neutral-400">
            <span className="truncate text-academy-gold">{visibleStudentId}</span>
            <span className="h-1 w-1 rounded-full bg-neutral-600" aria-hidden="true" />
            <span className="truncate">{batchName}</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <AttendanceButtonGroup
          compact
          status={student?.attendanceStatus}
          onChange={(status) => onAttendanceChange(student.id, status)}
        />
      </div>
    </article>
  );
}
