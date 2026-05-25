import * as React from "react";
import { UserRound } from "lucide-react";

export function getStudentPhotoUrl(student) {
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

const sizeClasses = {
  sm: "h-11 w-11 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-20 w-20 text-xl",
};

export default function StudentAvatar({ student, size = "md", className = "" }) {
  const photoUrl = getStudentPhotoUrl(student);
  const initials = getInitials(student?.name);
  const [imageFailed, setImageFailed] = React.useState(false);
  const showPhoto = photoUrl && !imageFailed;

  React.useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-academy-gold/35 bg-academy-gold/10 text-academy-gold ${sizeClasses[size] || sizeClasses.md} ${className}`.trim()}
    >
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={student?.name ? `${student.name} profile` : "Student profile"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : initials ? (
        <span className="font-semibold">{initials}</span>
      ) : (
        <UserRound size={size === "lg" ? 30 : 22} aria-hidden="true" />
      )}
    </div>
  );
}
