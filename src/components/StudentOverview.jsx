import * as React from "react";
import { CalendarDays, CircleDollarSign, ClipboardCheck, Users } from "lucide-react";
import DashboardCard from "./DashboardCard";
import FeeStatusBadge from "./FeeStatusBadge";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  getBatchById,
  getLocalDateKey,
  getLocalMonthKey,
} from "../utils/formatters";

function getMonthKeyFromDate(value) {
  return value ? String(value).slice(0, 7) : "";
}

function getPercentage(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function getAttendanceStatusForDate(attendanceRecords, studentId, date, fallback = "") {
  return (
    attendanceRecords.find((record) => record.studentId === studentId && record.date === date)
      ?.status || fallback
  );
}

function AttendanceStatusBadge({ status }) {
  const isPresent = status === "present";

  return (
    <span
      className={`inline-flex min-h-7 items-center justify-center rounded-md border px-2 text-xs font-medium capitalize ${
        isPresent
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/40 bg-rose-400/10 text-rose-200"
      }`}
    >
      {status || "not marked"}
    </span>
  );
}

export default function StudentOverview({
  attendanceRecords = [],
  attendanceError = "",
  batches = [],
  feeRecords = [],
  feeError = "",
  isLoading = false,
  student,
  studentError = "",
  studentId = "",
}) {
  const portalErrors = [studentError, attendanceError, feeError].filter(Boolean);

  if (import.meta.env.DEV) {
    console.debug("[StudentOverview]", {
      attendanceRecords: attendanceRecords.length,
      feeRecords: feeRecords.length,
      hasStudent: Boolean(student),
      studentFields: student ? Object.keys(student).sort() : [],
      studentId,
    });
  }

  if (isLoading && !student) {
    return (
      <section className="surface p-4">
        <p className="section-title">Student + parent portal</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Loading dashboard...</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Fetching student profile, attendance, and fee records.
        </p>
      </section>
    );
  }

  if (portalErrors.length > 0 && !student) {
    return (
      <section className="surface p-4">
        <p className="section-title">Student + parent portal</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Unable to load student dashboard</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          This login is active, but Firestore did not return the student dashboard records.
        </p>
        <div className="mt-4 space-y-2">
          {portalErrors.map((error) => (
            <p
              key={error}
              className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
            >
              {error}
            </p>
          ))}
        </div>
      </section>
    );
  }

  if (!student) {
    return (
      <section className="surface p-4">
        <p className="section-title">Student + parent portal</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Student record not found</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          No student document was found for this shared login. Create the Firestore document at
          students/{studentId || "signed-in user UID"}.
        </p>
      </section>
    );
  }

  const batch = getBatchById(batches, student.batchId);
  const todayStatus = getAttendanceStatusForDate(
    attendanceRecords,
    student.id,
    getLocalDateKey(),
    "not marked",
  );
  const currentFeeRecord = feeRecords.find(
    (record) => record.studentId === student.id && record.month === getLocalMonthKey(),
  );
  const profilePendingFees = Number(student.pendingFees ?? 0);
  const currentFeeStatus =
    currentFeeRecord?.status || (profilePendingFees > 0 ? "pending" : student.feeStatus || "pending");
  const currentFeeAmount = Number(currentFeeRecord?.amount ?? student.monthlyFee ?? student.feeAmount ?? 0);
  const currentAmountPaid = Number(
    currentFeeRecord?.amountPaid ??
      (currentFeeStatus === "paid" && profilePendingFees <= 0 ? currentFeeAmount : 0),
  );
  const currentDueAmount =
    currentFeeRecord?.dueAmount ?? profilePendingFees ?? Math.max(currentFeeAmount - currentAmountPaid, 0);
  const ownAttendanceRecords = attendanceRecords.filter((record) => record.studentId === student.id);
  const ownFeeRecords = feeRecords.filter((record) => record.studentId === student.id);
  const currentMonthAttendanceRecords = ownAttendanceRecords.filter(
    (record) => getMonthKeyFromDate(record.date) === getLocalMonthKey(),
  );
  const attendanceSummary = {
    present: currentMonthAttendanceRecords.filter((record) => record.status === "present").length,
    absent: currentMonthAttendanceRecords.filter((record) => record.status === "absent").length,
    marked: currentMonthAttendanceRecords.length,
  };
  const attendancePercentage = getPercentage(attendanceSummary.present, attendanceSummary.marked);

  return (
    <div className="space-y-8">
      <section>
        <p className="section-title">Student + parent portal</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {student.name || "Student dashboard"}
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Read-only academy overview for the student and parent.
        </p>
      </section>

      {portalErrors.length > 0 && (
        <div className="space-y-2">
          {portalErrors.map((error) => (
            <p
              key={error}
              className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
            >
              {error}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          icon={Users}
          label="Student"
          value={student.name || "Not added"}
          helper={batch?.name || "Batch not assigned"}
        />
        <DashboardCard
          icon={ClipboardCheck}
          label="Attendance summary"
          value={`${attendancePercentage}%`}
          helper={
            attendanceSummary.marked
              ? `${attendanceSummary.present} present, ${attendanceSummary.absent} absent this month`
              : "No attendance marked this month"
          }
        />
        <DashboardCard
          icon={CircleDollarSign}
          label="Fee status"
          value={currentFeeStatus === "paid" ? "Paid" : "Pending"}
          helper={`${formatCurrency(currentAmountPaid)} paid, ${formatCurrency(currentDueAmount)} due`}
        />
        <DashboardCard
          icon={CircleDollarSign}
          label="Pending fees"
          value={formatCurrency(currentDueAmount)}
          helper="Current month dues"
        />
        <DashboardCard
          icon={CircleDollarSign}
          label="Monthly fee"
          value={formatCurrency(currentFeeAmount)}
          helper={currentFeeRecord ? "From saved fee record" : "From student profile"}
        />
        <DashboardCard
          icon={CalendarDays}
          label="Join date"
          value={formatDate(student.joinDate)}
          helper={`Today: ${
            todayStatus === "present" ? "Present" : todayStatus === "absent" ? "Absent" : "Not marked"
          }`}
        />
      </div>

      <section className="surface p-4">
        <h3 className="text-lg font-semibold text-white">Student and parent details</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-neutral-500">Name</dt>
            <dd className="mt-1 text-white">{student.name || "Not added"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Student ID</dt>
            <dd className="mt-1 text-white">{student.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Batch</dt>
            <dd className="mt-1 text-white">{batch?.name || "Not assigned"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Join date</dt>
            <dd className="mt-1 text-white">{formatDate(student.joinDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Student phone</dt>
            <dd className="mt-1 text-white">{student.studentPhoneNumber || "Not added"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Parent name</dt>
            <dd className="mt-1 text-white">{student.parentName || "Not added"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Parent phone</dt>
            <dd className="mt-1 text-white">{student.parentPhoneNumber || "Not added"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Coach</dt>
            <dd className="mt-1 text-white">{batch?.coach || "Not assigned"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Monthly fee</dt>
            <dd className="mt-1 text-white">{formatCurrency(currentFeeAmount)}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-500">Pending fees</dt>
            <dd className="mt-1 text-white">{formatCurrency(currentDueAmount)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <div>
          <p className="section-title">Attendance</p>
          <h3 className="mt-2 text-lg font-semibold text-white">My attendance history</h3>
        </div>

        {ownAttendanceRecords.length === 0 ? (
          <div className="surface p-4 text-sm text-neutral-400">No attendance records found.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ownAttendanceRecords.map((record) => (
              <article key={record.id} className="surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      {formatDate(record.date)}
                    </p>
                    <p className="mt-2 font-medium text-white">{batch?.name || "Student batch"}</p>
                  </div>
                  <AttendanceStatusBadge status={record.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="section-title">Fees</p>
          <h3 className="mt-2 text-lg font-semibold text-white">My fee history</h3>
        </div>

        {ownFeeRecords.length === 0 ? (
          <div className="surface p-4 text-sm text-neutral-400">
            No saved fee records found for this account.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ownFeeRecords.map((record) => (
              <article key={record.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      {formatMonth(record.month)}
                    </p>
                    <p className="mt-2 font-medium text-white">{formatCurrency(record.amount)}</p>
                    <p className="mt-1 text-sm text-neutral-400">
                      Paid {formatCurrency(record.amountPaid)} | Due {formatCurrency(record.dueAmount)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {record.paymentDate ? formatDate(record.paymentDate) : "Payment pending"}
                    </p>
                    {record.notes && <p className="mt-2 text-sm text-neutral-300">{record.notes}</p>}
                  </div>
                  <FeeStatusBadge status={record.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
