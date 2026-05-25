import * as React from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarX,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Dumbbell,
  Megaphone,
  Package,
  Pin,
  Tag,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";
import FeeStatusBadge from "./FeeStatusBadge";
import StudentAvatar from "./StudentAvatar";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  getBatchById,
  getLocalDateKey,
  getLocalMonthKey,
} from "../utils/formatters";

const ANNOUNCEMENT_CATEGORIES = ["Important", "Tournament", "Training", "Fees", "Holiday"];

const ANNOUNCEMENT_CATEGORY_META = {
  Important: {
    icon: AlertTriangle,
    className: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  },
  Tournament: {
    icon: Trophy,
    className: "border-academy-gold/45 bg-academy-gold/12 text-academy-gold",
  },
  Training: {
    icon: Dumbbell,
    className: "border-sky-300/35 bg-sky-300/10 text-sky-100",
  },
  Fees: {
    icon: WalletCards,
    className: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
  },
  Holiday: {
    icon: CalendarX,
    className: "border-violet-300/35 bg-violet-300/10 text-violet-100",
  },
};

function getAnnouncementCategoryMeta(category) {
  return ANNOUNCEMENT_CATEGORY_META[category] || ANNOUNCEMENT_CATEGORY_META.Important;
}

function getMonthKeyFromDate(value) {
  return value ? String(value).slice(0, 7) : "";
}

function getPercentage(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

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

function getDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDisplayDate(value) {
  const date = getDate(value);

  if (!date) {
    return "Not added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAnnouncementTimestamp(value) {
  const date = getDate(value);

  if (!date) {
    return "Just now";
  }

  const today = new Date();
  const dateKey = getLocalDateKey(date);

  if (dateKey === getLocalDateKey(today)) {
    return `Today, ${new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date)}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dateKey === getLocalDateKey(yesterday)) {
    return "Yesterday";
  }

  return formatDisplayDate(date);
}

function getTimestampMillis(value) {
  const date = getDate(value);
  return date ? date.getTime() : 0;
}

function getAttendanceStatusForDate(attendanceRecords, studentId, date, fallback = "") {
  return (
    attendanceRecords.find((record) => record.studentId === studentId && record.date === date)
      ?.status || fallback
  );
}

function getAnnouncementCategory(announcement) {
  const category = String(announcement.category || "Important").trim();
  return ANNOUNCEMENT_CATEGORIES.includes(category) ? category : "Important";
}

function isAnnouncementPinned(announcement) {
  return announcement.pinned === true;
}

function AttendanceStatusBadge({ status }) {
  const isPresent = status === "present";

  return (
    <span
      className={`inline-flex min-h-7 max-w-full items-center justify-center rounded-md border px-2 text-xs font-medium capitalize ${
        isPresent
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/40 bg-rose-400/10 text-rose-200"
      }`}
    >
      {status || "not marked"}
    </span>
  );
}

function StudentPageHeader({ eyebrow, title, helper }) {
  return (
    <section className="space-y-2">
      <p className="section-title">{eyebrow}</p>
      <h2 className="break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">
        {title}
      </h2>
      {helper && <p className="max-w-2xl text-sm leading-6 text-neutral-400">{helper}</p>}
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="surface min-w-0 overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
            {label}
          </p>
          <p className="mt-3 break-words text-2xl font-semibold text-white">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-academy-gold/12 text-academy-gold">
          <Icon size={20} />
        </span>
      </div>
      {helper && <p className="mt-4 break-words text-sm leading-5 text-neutral-500">{helper}</p>}
    </article>
  );
}

function ProfileCard({ batch, student, visibleStudentId }) {
  return (
    <section className="surface overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <StudentAvatar student={student} size="lg" />
          <div className="min-w-0">
            <p className="section-title">Student + Parent</p>
            <h3 className="mt-2 break-words text-2xl font-semibold text-white">
              {student.name || "Student profile"}
            </h3>
            <p className="mt-2 break-words text-sm text-neutral-400">
              {batch?.name || "Batch not assigned"} | {visibleStudentId}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-academy-gold/40 bg-academy-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-academy-gold">
          Read only
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Parent", student.parentName || "Not added"],
          ["Parent phone", student.parentPhoneNumber || "Not added"],
          ["Student phone", student.studentPhoneNumber || "Not added"],
          ["Date of birth", formatDate(student.dateOfBirth || student.joinDate)],
          ["Coach", batch?.coach || "Not assigned"],
          ["Monthly fee", formatCurrency(student.monthlyFee ?? student.feeAmount)],
          ["Pending fees", formatCurrency(student.pendingFees)],
          ["Fee status", student.feeStatus || "Pending"],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</dt>
            <dd className="mt-2 break-words text-sm font-medium text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function EmptyState({ children }) {
  return <div className="surface p-4 text-sm leading-6 text-neutral-400">{children}</div>;
}

function ProgressRing({ percentage }) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div
      className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(rgb(var(--academy-gold)) ${clampedPercentage}%, rgba(212, 175, 55, 0.16) 0)`,
      }}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-academy-panel text-xl font-semibold text-white">
        {clampedPercentage}%
      </div>
    </div>
  );
}

function AnnouncementCategoryChip({
  category,
  count,
  isActive = false,
  onClick,
  pinned = false,
}) {
  const categoryName = category === "All" ? "All" : getAnnouncementCategory({ category });
  const meta = categoryName === "All"
    ? { icon: Tag, className: "border-white/10 bg-white/[0.04] text-neutral-300" }
    : getAnnouncementCategoryMeta(categoryName);
  const Icon = pinned ? Pin : meta.icon;
  const chipContent = (
    <>
      <Icon size={14} />
      <span>{pinned ? "Pinned" : categoryName}</span>
      {typeof count === "number" && (
        <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">{count}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium uppercase tracking-[0.1em] transition ${
          isActive ? "border-academy-gold bg-academy-gold text-black" : meta.className
        }`}
        onClick={onClick}
      >
        {chipContent}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] ${meta.className}`}
    >
      {chipContent}
    </span>
  );
}

function AnnouncementCard({ announcement, isPinned = false }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const category = getAnnouncementCategory(announcement);
  const message = String(announcement.message || "No message added.").trim();
  const canExpand = message.length > 180;
  const displayMessage = canExpand && !isExpanded ? `${message.slice(0, 180).trim()}...` : message;

  return (
    <article className="surface min-w-0 overflow-hidden p-4 transition hover:-translate-y-0.5 hover:border-academy-gold/40 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-academy-gold/12 text-academy-gold">
          {isPinned ? <Pin size={18} /> : <Megaphone size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AnnouncementCategoryChip category={category} />
            {isPinned && <AnnouncementCategoryChip category={category} pinned />}
          </div>
          <h3 className="mt-3 break-words text-lg font-semibold text-white">
            {announcement.title || "Untitled announcement"}
          </h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">
            {displayMessage}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-neutral-500">
              {formatAnnouncementTimestamp(announcement.createdAt)}
            </p>
            {canExpand && (
              <button
                type="button"
                className="inline-flex min-h-9 w-fit items-center gap-1 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-neutral-300 transition hover:border-academy-gold/60 hover:text-white"
                onClick={() => setIsExpanded((current) => !current)}
              >
                {isExpanded ? "Show less" : "Read more"}
                <ChevronDown
                  size={14}
                  className={`transition ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function OverviewPage({ data }) {
  const latestAnnouncement = data.announcements[0];

  return (
    <div className="space-y-5">
      <StudentPageHeader
        eyebrow="Overview"
        title={data.student.name || "Student dashboard"}
        helper=""
      />

      <ProfileCard
        batch={data.batch}
        student={data.student}
        visibleStudentId={data.visibleStudentId}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ClipboardCheck}
          label="Attendance"
          value={`${data.attendancePercentage}%`}
          helper={
            data.attendanceSummary.marked
              ? `${data.attendanceSummary.present} present this month`
              : "No attendance marked this month"
          }
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Pending fees"
          value={formatCurrency(data.currentDueAmount)}
          helper={`${formatCurrency(data.currentAmountPaid)} paid this month`}
        />
        <MetricCard
          icon={Megaphone}
          label="Latest update"
          value={latestAnnouncement?.title || "No updates"}
          helper={latestAnnouncement ? formatDisplayDate(latestAnnouncement.createdAt) : "No announcement yet"}
        />
        <MetricCard
          icon={Package}
          label="Equipment dues"
          value={formatCurrency(data.equipmentTotals.due)}
          helper={`${data.ownEquipmentPurchases.length} purchase records`}
        />
      </section>
    </div>
  );
}

function AttendancePage({ data }) {
  const recentRecords = data.ownAttendanceRecords.slice(0, 12);

  return (
    <div className="space-y-5">
      <StudentPageHeader
        eyebrow="Attendance"
        title="Attendance history"
      />

      <section className="surface flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="section-title">This month</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {data.attendanceSummary.marked} marked sessions
          </h3>
          <p className="mt-2 text-sm text-neutral-400">
            {data.attendanceSummary.present} present | {data.attendanceSummary.absent} absent
          </p>
        </div>
        <ProgressRing percentage={data.attendancePercentage} />
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="section-title">Calendar list</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Recent attendance</h3>
          </div>
          <span className="text-sm text-neutral-500">{data.ownAttendanceRecords.length} records</span>
        </div>

        {recentRecords.length === 0 ? (
          <EmptyState>No attendance records found.</EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentRecords.map((record) => (
              <article key={record.id} className="surface min-w-0 overflow-hidden p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-xs uppercase tracking-[0.18em] text-neutral-500">
                      {formatDate(record.date)}
                    </p>
                    <p className="mt-2 break-words font-medium text-white">
                      {data.batch?.name || "Student batch"}
                    </p>
                  </div>
                  <AttendanceStatusBadge status={record.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FeesPage({ data }) {
  return (
    <div className="space-y-5">
      <StudentPageHeader
        eyebrow="Fees"
        title="Fee status"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={CircleDollarSign}
          label="Current dues"
          value={formatCurrency(data.currentDueAmount)}
          helper={data.currentFeeStatus === "paid" ? "No pending dues" : "Payment pending"}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Amount paid"
          value={formatCurrency(data.currentAmountPaid)}
          helper={formatMonth(getLocalMonthKey())}
        />
        <MetricCard
          icon={CalendarDays}
          label="Monthly fee"
          value={formatCurrency(data.currentFeeAmount)}
          helper={data.currentFeeRecord ? "Saved fee record" : "Student profile"}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="section-title">Payment history</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Fee records</h3>
          </div>
          <FeeStatusBadge status={data.currentFeeStatus} />
        </div>

        {data.ownFeeRecords.length === 0 ? (
          <EmptyState>No saved fee records found for this account.</EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.ownFeeRecords.map((record) => (
              <article key={record.id} className="surface min-w-0 overflow-hidden p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      {formatMonth(record.month)}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {formatCurrency(record.amount)}
                    </p>
                    <p className="mt-2 text-sm text-neutral-400">
                      Paid {formatCurrency(record.amountPaid)} | Due {formatCurrency(record.dueAmount)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {record.paymentDate ? formatDate(record.paymentDate) : "Payment pending"}
                    </p>
                  </div>
                  <FeeStatusBadge status={record.status} />
                </div>
                {record.notes && <p className="mt-3 text-sm text-neutral-300">{record.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EquipmentPage({ data }) {
  return (
    <div className="space-y-5">
      <StudentPageHeader
        eyebrow="Equipment"
        title="Equipment purchases"
        helper="View purchased items, payments made, and pending equipment balances."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={Package}
          label="Purchase total"
          value={formatCurrency(data.equipmentTotals.total)}
          helper="Total equipment value"
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Paid"
          value={formatCurrency(data.equipmentTotals.paid)}
          helper="Equipment payments"
        />
        <MetricCard
          icon={ClipboardCheck}
          label="Pending"
          value={formatCurrency(data.equipmentTotals.due)}
          helper="Equipment balance"
        />
      </section>

      {data.ownEquipmentPurchases.length === 0 ? (
        <EmptyState>No equipment purchases found for this account.</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.ownEquipmentPurchases.map((purchase) => (
            <article key={purchase.id} className="surface min-w-0 overflow-hidden p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-xs uppercase tracking-[0.18em] text-neutral-500">
                    {purchase.category}
                  </p>
                  <h3 className="mt-2 break-words text-lg font-semibold text-white">
                    {purchase.itemName}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Purchased {formatDate(purchase.purchaseDate)}
                  </p>
                </div>
                <FeeStatusBadge status={purchase.paymentStatus} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="min-w-0">
                  <dt className="text-neutral-500">Total</dt>
                  <dd className="mt-1 break-words text-white">
                    {formatCurrency(purchase.totalPrice)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-neutral-500">Paid</dt>
                  <dd className="mt-1 break-words text-white">
                    {formatCurrency(purchase.paidAmount)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-neutral-500">Due</dt>
                  <dd className="mt-1 break-words text-white">
                    {formatCurrency(purchase.dueAmount)}
                  </dd>
                </div>
              </dl>
              {purchase.notes && <p className="mt-3 text-sm text-neutral-300">{purchase.notes}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementsPage({ announcementError, announcements }) {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const decoratedAnnouncements = announcements.map((announcement) => ({
    ...announcement,
    category: getAnnouncementCategory(announcement),
    isPinned: isAnnouncementPinned(announcement),
  }));
  const categoryCounts = decoratedAnnouncements.reduce(
    (counts, announcement) => ({
      ...counts,
      [announcement.category]: (counts[announcement.category] || 0) + 1,
    }),
    {},
  );
  const visibleAnnouncements =
    selectedCategory === "All"
      ? decoratedAnnouncements
      : decoratedAnnouncements.filter((announcement) => announcement.category === selectedCategory);
  const pinnedAnnouncements = visibleAnnouncements.filter((announcement) => announcement.isPinned);
  const regularAnnouncements = visibleAnnouncements.filter((announcement) => !announcement.isPinned);

  return (
    <div className="space-y-5 pb-2">
      <StudentPageHeader
        eyebrow="Announcements"
        title="Academy updates"
        helper="Important notices, training updates, fee reminders, and tournament news."
      />

      {announcementError && (
        <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
          {announcementError}
        </p>
      )}

      {decoratedAnnouncements.length === 0 ? (
        <EmptyState>
          No announcements have been published yet. New academy updates will appear here first.
        </EmptyState>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <AnnouncementCategoryChip
                category="All"
                count={decoratedAnnouncements.length}
                isActive={selectedCategory === "All"}
                onClick={() => setSelectedCategory("All")}
              />
              {ANNOUNCEMENT_CATEGORIES.map((category) => (
                <AnnouncementCategoryChip
                  key={category}
                  category={category}
                  count={categoryCounts[category] || 0}
                  isActive={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </section>

          {visibleAnnouncements.length === 0 ? (
            <EmptyState>No {selectedCategory.toLowerCase()} announcements are available.</EmptyState>
          ) : (
            <>
              {pinnedAnnouncements.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <p className="section-title">Pinned</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">Important notices</h3>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {pinnedAnnouncements.map((announcement) => (
                      <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        isPinned={announcement.isPinned}
                      />
                    ))}
                  </div>
                </section>
              )}

              {regularAnnouncements.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <p className="section-title">Feed</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {selectedCategory === "All" ? "All announcements" : selectedCategory}
                    </h3>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {regularAnnouncements.map((announcement) => (
                      <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        isPinned={announcement.isPinned}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function StudentOverview({
  activeView = "overview",
  attendanceRecords = [],
  attendanceError = "",
  announcements = [],
  announcementError = "",
  batches = [],
  equipmentPurchases = [],
  equipmentError = "",
  feeRecords = [],
  feeError = "",
  isLoading = false,
  student,
  studentError = "",
  studentId = "",
}) {
  const portalErrors = [
    studentError,
    attendanceError,
    feeError,
    equipmentError,
    activeView !== "announcements" ? announcementError : "",
  ].filter(Boolean);

  if (import.meta.env.DEV) {
    console.debug("[StudentOverview]", {
      activeView,
      attendanceRecords: attendanceRecords.length,
      announcements: announcements.length,
      equipmentPurchases: equipmentPurchases.length,
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
          Fetching student profile, attendance, fee, equipment, and announcement records.
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
          This login is active, but Firestore did not return the student portal records.
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
  const visibleStudentId = getVisibleStudentId(student);
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
  const ownAttendanceRecords = attendanceRecords
    .filter((record) => record.studentId === student.id)
    .sort((first, second) => String(second.date).localeCompare(String(first.date)));
  const ownFeeRecords = feeRecords
    .filter((record) => record.studentId === student.id)
    .sort((first, second) => String(second.month).localeCompare(String(first.month)));
  const ownEquipmentPurchases = equipmentPurchases
    .filter((record) => record.studentId === student.id)
    .sort((first, second) => String(second.purchaseDate).localeCompare(String(first.purchaseDate)));
  const sortedAnnouncements = [...announcements].sort(
    (first, second) => {
      if (Boolean(first.pinned) !== Boolean(second.pinned)) {
        return first.pinned ? -1 : 1;
      }

      return getTimestampMillis(second.createdAt) - getTimestampMillis(first.createdAt);
    },
  );
  const equipmentTotals = ownEquipmentPurchases.reduce(
    (summary, purchase) => ({
      paid: summary.paid + Number(purchase.paidAmount || 0),
      due: summary.due + Number(purchase.dueAmount || 0),
      total: summary.total + Number(purchase.totalPrice || 0),
    }),
    { paid: 0, due: 0, total: 0 },
  );
  const currentMonthAttendanceRecords = ownAttendanceRecords.filter(
    (record) => getMonthKeyFromDate(record.date) === getLocalMonthKey(),
  );
  const attendanceSummary = {
    present: currentMonthAttendanceRecords.filter((record) => record.status === "present").length,
    absent: currentMonthAttendanceRecords.filter((record) => record.status === "absent").length,
    marked: currentMonthAttendanceRecords.length,
  };
  const attendancePercentage = getPercentage(attendanceSummary.present, attendanceSummary.marked);
  const data = {
    announcements: sortedAnnouncements,
    attendancePercentage,
    attendanceSummary,
    batch,
    currentAmountPaid,
    currentDueAmount,
    currentFeeAmount,
    currentFeeRecord,
    currentFeeStatus,
    equipmentTotals,
    ownAttendanceRecords,
    ownEquipmentPurchases,
    ownFeeRecords,
    student,
    todayStatus,
    visibleStudentId,
  };
  const pageMap = {
    overview: <OverviewPage data={data} />,
    attendance: <AttendancePage data={data} />,
    fees: <FeesPage data={data} />,
    equipment: <EquipmentPage data={data} />,
    announcements: (
      <AnnouncementsPage announcementError={announcementError} announcements={data.announcements} />
    ),
  };

  return (
    <div className="student-portal space-y-6">
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

      {pageMap[activeView] || pageMap.overview}
    </div>
  );
}
