import * as React from "react";
import { UserRound } from "lucide-react";
import AttendanceButtonGroup from "./AttendanceButtonGroup";

function getVisibleStudentId(student) {
  const studentId = String(student?.studentId || "").trim();
  const documentId = String(student?.id || "").trim();

  if (studentId && studentId !== documentId) {
    return studentId;
  }

  if (/^(ST|ARC)-/i.test(documentId) || documentId.length <= 12) {
    return documentId;
  }

  return "Student ID not added";
}

function getStudentPhotoUrl(student) {
  const possibleFields = [
    student?.photoUrl,
    student?.photoURL,
    student?.profilePhotoUrl,
    student?.profilePhoto,
    student?.studentPhotoUrl,
    student?.studentPhoto,
    student?.avatarUrl,
    student?.imageUrl,
    student?.photo,
  ];

  return possibleFields.find((value) => typeof value === "string" && value.trim()) || "";
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function StudentAvatar({ student }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const photoUrl = getStudentPhotoUrl(student);
  const initials = getInitials(student?.name);
  const showPhoto = photoUrl && !imageFailed;

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-academy-gold/35 bg-academy-gold/10 text-academy-gold">
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={student?.name ? `${student.name} profile` : "Student profile"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : initials ? (
        <span className="text-sm font-semibold">{initials}</span>
      ) : (
        <UserRound size={20} aria-hidden="true" />
      )}
    </div>
  );
}

export default function AttendanceStudentCard({ student, batch, onAttendanceChange }) {
  const visibleStudentId = getVisibleStudentId(student);
  const batchName = batch?.name || student?.batchName || student?.batch || "No batch";

  return (
    <article className="attendance-student-card surface min-w-0 overflow-hidden p-3">
      <div className="flex min-w-0 items-center gap-3">
        <StudentAvatar student={student} />

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
