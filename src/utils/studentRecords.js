export const MISSING_STUDENT_ID_LABEL = "Student ID not added";

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampAmount(value, maxValue = Infinity) {
  return Math.min(Math.max(toFiniteNumber(value), 0), maxValue);
}

export function getVisibleStudentId(student) {
  const studentId = String(student?.studentId || "").trim();
  const documentId = String(student?.id || "").trim();

  if (studentId && studentId !== documentId) {
    return studentId;
  }

  if (/^(ST|ARC|AB)-/i.test(documentId) || documentId.length <= 12) {
    return documentId;
  }

  return MISSING_STUDENT_ID_LABEL;
}

export function compareStudentsByVisibleId(first, second) {
  const firstStudentId = getVisibleStudentId(first);
  const secondStudentId = getVisibleStudentId(second);
  const firstMissing = firstStudentId === MISSING_STUDENT_ID_LABEL;
  const secondMissing = secondStudentId === MISSING_STUDENT_ID_LABEL;

  if (firstMissing !== secondMissing) {
    return firstMissing ? 1 : -1;
  }

  const idComparison = firstStudentId.localeCompare(secondStudentId, undefined, {
    numeric: true,
    sensitivity: "base",
  });

  if (idComparison !== 0) {
    return idComparison;
  }

  return String(first?.name || "").localeCompare(String(second?.name || ""), undefined, {
    sensitivity: "base",
  });
}

export function sortStudentsByVisibleId(students) {
  return [...students].sort(compareStudentsByVisibleId);
}

export function getStudentMonthlyFeeSummary(student, feeRecord) {
  const studentAmount = Math.max(toFiniteNumber(student?.monthlyFee ?? student?.feeAmount), 0);
  const amount = Math.max(toFiniteNumber(feeRecord?.amount, studentAmount), 0);
  const recordStatus = String(feeRecord?.status || "").toLowerCase();
  const profileStatus = String(student?.feeStatus || "").toLowerCase();
  const profilePendingFees = clampAmount(student?.pendingFees);
  const profileIsPaid = profileStatus === "paid" && profilePendingFees <= 0;
  const savedDueAmount = Number.isFinite(Number(feeRecord?.dueAmount))
    ? Math.max(Number(feeRecord.dueAmount), 0)
    : null;
  const defaultPaidAmount =
    savedDueAmount !== null
      ? Math.max(amount - savedDueAmount, 0)
      : recordStatus === "paid"
        ? amount
        : 0;
  const amountPaid = feeRecord
    ? clampAmount(feeRecord.amountPaid ?? defaultPaidAmount, amount)
    : profileIsPaid
      ? amount
      : 0;
  const dueAmount = feeRecord
    ? Math.max(amount - amountPaid, 0)
    : profileIsPaid
      ? 0
      : Math.max(profilePendingFees || amount, 0);

  return {
    amount,
    amountPaid,
    dueAmount,
    status: dueAmount <= 0 ? "paid" : "pending",
    paymentDate: feeRecord?.paymentDate || "",
    notes: feeRecord?.notes || "",
    updatedBy: feeRecord?.updatedBy || "",
    timestamp: feeRecord?.timestamp || null,
    isSaved: Boolean(feeRecord),
  };
}

export function getStudentFeeSummaryForMonth(student, feeRecords, month) {
  const feeRecord = feeRecords.find(
    (record) => record.studentId === student?.id && record.month === month,
  );

  return {
    feeRecord,
    ...getStudentMonthlyFeeSummary(student, feeRecord),
  };
}
