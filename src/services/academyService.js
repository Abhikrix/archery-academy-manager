import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";
import { batches, students } from "../data/mockData";
import { getLocalDateKey, getLocalMonthKey } from "../utils/formatters";

const defaultStudentValues = {
  parentName: "",
  parentPhone: "",
  parentPhoneNumber: "",
  studentPhone: "",
  studentPhoneNumber: "",
  joinDate: "",
  feeStatus: "pending",
  monthlyFee: 0,
  pendingFees: 0,
  attendanceStatus: "present",
  attendanceRate: 0,
};

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured. Add your VITE_FIREBASE_* values first.");
  }
}

function normalizeStudentSnapshot(snapshot) {
  const data = snapshot.data();

  return createStudentRecord({
    ...data,
    id: data.id || snapshot.id,
  });
}

function normalizeAttendanceSnapshot(snapshot) {
  const data = snapshot.data();

  return createAttendanceRecord({
    ...data,
    id: snapshot.id,
  });
}

function normalizeFeeSnapshot(snapshot) {
  const data = snapshot.data();

  return createFeeRecord({
    ...data,
    id: snapshot.id,
  });
}

function getAttendanceRecordId(studentId, date) {
  return `${studentId}_${date}`.replace(/\//g, "-");
}

function getFeeRecordId(studentId, month) {
  return `${studentId}_${month}`.replace(/\//g, "-");
}

function sortAttendanceRecords(records) {
  return [...records].sort((first, second) => {
    if (first.date === second.date) {
      return first.studentId.localeCompare(second.studentId);
    }

    return second.date.localeCompare(first.date);
  });
}

function sortFeeRecords(records) {
  return [...records].sort((first, second) => {
    if (first.month === second.month) {
      return first.studentId.localeCompare(second.studentId);
    }

    return second.month.localeCompare(first.month);
  });
}

export function getInitialAcademySnapshot() {
  return {
    batches,
    students: students.map(createStudentRecord),
  };
}

export function createAttendanceRecord(record) {
  const studentId = String(record.studentId || "").trim();
  const date = record.date || getLocalDateKey();

  return {
    id: record.id || getAttendanceRecordId(studentId, date),
    studentId,
    date,
    status: record.status === "absent" ? "absent" : "present",
    markedAt: record.markedAt || null,
    updatedAt: record.updatedAt || null,
  };
}

export function createInitialAttendanceRecords(studentsState, date = getLocalDateKey()) {
  return studentsState.map((student) =>
    createAttendanceRecord({
      studentId: student.id,
      date,
      status: student.attendanceStatus || "absent",
    }),
  );
}

export function upsertAttendanceRecord(records, nextRecord) {
  const normalizedRecord = createAttendanceRecord(nextRecord);

  if (!normalizedRecord.studentId || !normalizedRecord.date) {
    return records;
  }

  const nextRecords = records.filter((record) => record.id !== normalizedRecord.id);
  return sortAttendanceRecords([...nextRecords, normalizedRecord]);
}

export function createFeeRecord(record) {
  const studentId = String(record.studentId || "").trim();
  const studentName = String(record.studentName || "").trim();
  const month = record.month || getLocalMonthKey();
  const amount = Number(record.amount || 0);
  const defaultPaidAmount = record.status === "paid" ? amount : 0;
  const amountPaid = Math.min(
    Math.max(Number(record.amountPaid ?? defaultPaidAmount) || 0, 0),
    amount,
  );
  const dueAmount = Math.max(amount - amountPaid, 0);
  const status = record.status === "paid" || dueAmount === 0 ? "paid" : "pending";

  return {
    id: record.id || getFeeRecordId(studentId, month),
    studentId,
    studentName,
    month,
    amount,
    amountPaid,
    dueAmount,
    status,
    paymentDate: status === "paid" ? record.paymentDate || getLocalDateKey() : record.paymentDate || "",
    notes: String(record.notes || "").trim(),
    updatedBy: String(record.updatedBy || "").trim(),
    timestamp: record.timestamp || null,
    createdAt: record.createdAt || null,
    updatedAt: record.updatedAt || null,
  };
}

export function createInitialFeeRecords(studentsState, month = getLocalMonthKey()) {
  return studentsState.map((student) =>
    createFeeRecord({
      studentId: student.id,
      studentName: student.name,
      month,
      amount: student.feeAmount,
      amountPaid: student.feeStatus === "paid" ? student.feeAmount : 0,
      status: student.feeStatus || "pending",
      paymentDate: student.feeStatus === "paid" ? getLocalDateKey() : "",
      notes: "",
      updatedBy: "Local roster",
    }),
  );
}

export function upsertFeeRecord(records, nextRecord) {
  const normalizedRecord = createFeeRecord(nextRecord);

  if (!normalizedRecord.studentId || !normalizedRecord.month) {
    return records;
  }

  const nextRecords = records.filter((record) => record.id !== normalizedRecord.id);
  return sortFeeRecords([...nextRecords, normalizedRecord]);
}

export function createStudentRecord(student) {
  const id = String(student.id || student.uid || student.studentId || "").trim();
  const feeAmount = Number(student.feeAmount ?? student.monthlyFee ?? 0);
  const parentPhone = String(student.parentPhone || student.parentPhoneNumber || "").trim();
  const studentPhone = String(
    student.studentPhone || student.studentPhoneNumber || student.phoneNumber || "",
  ).trim();
  const batchId = student.batchId || student.batch || batches[0]?.id || "";

  return {
    ...defaultStudentValues,
    ...student,
    id,
    studentId: String(student.studentId || id).trim(),
    name: String(student.name || "").trim(),
    parentName: String(student.parentName || "").trim(),
    parentPhone,
    parentPhoneNumber: parentPhone,
    studentPhone,
    studentPhoneNumber: studentPhone,
    batch: batchId,
    batchId,
    feeAmount,
    monthlyFee: Number(student.monthlyFee ?? feeAmount),
    pendingFees: Number(student.pendingFees ?? 0),
    joinDate: student.joinDate || "",
  };
}

export function updateStudentRecord(studentsState, studentId, patch) {
  return studentsState.map((student) =>
    student.id === studentId ? { ...student, ...patch } : student,
  );
}

export function removeStudentRecord(studentsState, studentId) {
  return studentsState.filter((student) => student.id !== studentId);
}

export function subscribeToStudentRecords(onStudents, onError) {
  requireFirestore();

  const studentsQuery = query(collection(db, "students"));

  return onSnapshot(
    studentsQuery,
    (snapshot) => {
      onStudents(
        snapshot.docs
          .map(normalizeStudentSnapshot)
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    },
    onError,
  );
}

export function subscribeToStudentRecord(studentId, onStudent, onError) {
  requireFirestore();

  return onSnapshot(
    doc(db, "students", studentId),
    (snapshot) => {
      onStudent(snapshot.exists() ? normalizeStudentSnapshot(snapshot) : null);
    },
    onError,
  );
}

export function subscribeToAttendanceRecords(options, onRecords, onError) {
  requireFirestore();

  const attendanceCollection = collection(db, "attendance");
  const attendanceQuery = options?.studentId
    ? query(attendanceCollection, where("studentId", "==", options.studentId))
    : query(attendanceCollection);

  return onSnapshot(
    attendanceQuery,
    (snapshot) => {
      onRecords(sortAttendanceRecords(snapshot.docs.map(normalizeAttendanceSnapshot)));
    },
    onError,
  );
}

export function subscribeToFeeRecords(options, onRecords, onError) {
  requireFirestore();

  const feesCollection = collection(db, "fees");
  const feesQuery = options?.studentId
    ? query(feesCollection, where("studentId", "==", options.studentId))
    : query(feesCollection);

  return onSnapshot(
    feesQuery,
    (snapshot) => {
      onRecords(sortFeeRecords(snapshot.docs.map(normalizeFeeSnapshot)));
    },
    onError,
  );
}

export async function saveAttendanceRecord(record) {
  requireFirestore();

  const normalizedRecord = createAttendanceRecord(record);

  if (!normalizedRecord.studentId) {
    throw new Error("Student ID is required to save attendance.");
  }

  if (!normalizedRecord.date) {
    throw new Error("Attendance date is required.");
  }

  await setDoc(
    doc(db, "attendance", normalizedRecord.id),
    {
      studentId: normalizedRecord.studentId,
      date: normalizedRecord.date,
      status: normalizedRecord.status,
      markedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return normalizedRecord;
}

export async function saveFeeRecord(record) {
  requireFirestore();

  const normalizedRecord = createFeeRecord(record);

  if (!normalizedRecord.studentId) {
    throw new Error("Student ID is required to save a fee record.");
  }

  if (!normalizedRecord.month) {
    throw new Error("Fee month is required.");
  }

  await setDoc(
    doc(db, "fees", normalizedRecord.id),
    {
      studentId: normalizedRecord.studentId,
      studentName: normalizedRecord.studentName,
      month: normalizedRecord.month,
      amount: normalizedRecord.amount,
      amountPaid: normalizedRecord.amountPaid,
      dueAmount: normalizedRecord.dueAmount,
      status: normalizedRecord.status,
      paymentDate: normalizedRecord.paymentDate,
      notes: normalizedRecord.notes,
      updatedBy: normalizedRecord.updatedBy,
      timestamp: serverTimestamp(),
    },
    { merge: true },
  );

  return normalizedRecord;
}

export async function saveStudentRecord(student) {
  requireFirestore();

  const normalizedStudent = createStudentRecord(student);

  if (!normalizedStudent.id) {
    throw new Error("Student ID is required.");
  }

  if (!normalizedStudent.name) {
    throw new Error("Student name is required.");
  }

  const studentRef = doc(db, "students", normalizedStudent.id);

  await setDoc(
    studentRef,
    {
      ...normalizedStudent,
      updatedAt: serverTimestamp(),
      createdAt: student.createdAt || serverTimestamp(),
    },
    { merge: true },
  );

  return normalizedStudent;
}

export async function patchStudentRecord(studentId, patch) {
  requireFirestore();

  await updateDoc(doc(db, "students", studentId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStudentRecord(studentId) {
  requireFirestore();

  await deleteDoc(doc(db, "students", studentId));
}
