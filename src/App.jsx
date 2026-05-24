import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  Pencil,
  Search,
  Save,
  TrendingUp,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import DashboardCard from "./components/DashboardCard";
import FeeStatusBadge from "./components/FeeStatusBadge";
import LoginView from "./components/LoginView";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBadge from "./components/RoleBadge";
import StudentCard from "./components/StudentCard";
import StudentOverview from "./components/StudentOverview";
import { PERMISSIONS, ROLES } from "./constants/roles";
import { useAuth } from "./context/AuthContext";
import {
  createAttendanceRecord,
  createInitialAttendanceRecords,
  createInitialFeeRecords,
  createFeeRecord,
  createStudentRecord,
  deleteStudentRecord,
  getInitialAcademySnapshot,
  removeStudentRecord,
  saveAttendanceRecord,
  saveFeeRecord,
  saveStudentRecord,
  subscribeToAttendanceRecords,
  subscribeToFeeRecords,
  subscribeToStudentRecord,
  subscribeToStudentRecords,
  updateStudentRecord,
  upsertAttendanceRecord,
  upsertFeeRecord,
} from "./services/academyService";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  getBatchById,
  getLocalDateKey,
  getLocalMonthKey,
} from "./utils/formatters";
import { getRoleHomePath } from "./utils/roleRoutes";
import {
  createStudentAccount,
  deleteUserProfile,
  saveUserProfile,
  subscribeToUserProfiles,
} from "./services/authService";

function getDefaultStudentForm() {
  return {
    id: "",
    name: "",
    parentName: "",
    parentPhoneNumber: "",
    studentPhoneNumber: "",
    batchId: "junior-a",
    feeAmount: "2800",
    joinDate: new Date().toISOString().slice(0, 10),
    feeStatus: "pending",
    attendanceStatus: "present",
    attendanceRate: 0,
  };
}

function getDefaultUserForm() {
  return {
    uid: "",
    name: "",
    email: "",
    role: ROLES.COACH,
    studentId: "",
    createdAt: null,
  };
}

function getDefaultStudentAccountForm() {
  return {
    email: "",
    password: "",
    name: "",
    batchId: "junior-a",
    parentName: "",
    parentPhone: "",
    studentPhone: "",
    joinDate: new Date().toISOString().slice(0, 10),
    monthlyFee: "2800",
    pendingFees: "0",
    feeStatus: "pending",
  };
}

function getProfileStudentId(profile) {
  return profile?.uid || "";
}

const roleViews = {
  [ROLES.ADMIN]: [
    "dashboard",
    "attendance",
    "attendance-history",
    "fees",
    "students",
    "reports",
    "users",
    "settings",
  ],
  [ROLES.COACH]: ["attendance", "attendance-history", "fees", "students", "reports"],
  [ROLES.STUDENT]: ["overview"],
};

function App() {
  const { isFirebaseConfigured, profile } = useAuth();
  const snapshot = useMemo(() => getInitialAcademySnapshot(), []);
  const [students, setStudents] = useState(snapshot.students);
  const [attendanceRecords, setAttendanceRecords] = useState(() =>
    createInitialAttendanceRecords(snapshot.students),
  );
  const [feeRecords, setFeeRecords] = useState(() => createInitialFeeRecords(snapshot.students));
  const [attendanceDate, setAttendanceDate] = useState(getLocalDateKey);
  const [feeMonth, setFeeMonth] = useState(getLocalMonthKey);
  const [studentForm, setStudentForm] = useState(getDefaultStudentForm);
  const [studentAccountForm, setStudentAccountForm] = useState(getDefaultStudentAccountForm);
  const [userProfiles, setUserProfiles] = useState([]);
  const [userForm, setUserForm] = useState(getDefaultUserForm);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [isCreatingStudentAccount, setIsCreatingStudentAccount] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");
  const [feeError, setFeeError] = useState("");
  const [userError, setUserError] = useState("");
  const [studentNotice, setStudentNotice] = useState("");
  const [studentAccountError, setStudentAccountError] = useState("");
  const [studentAccountNotice, setStudentAccountNotice] = useState("");
  const [feeNotice, setFeeNotice] = useState("");
  const [userNotice, setUserNotice] = useState("");
  const usesFirestoreStudents = Boolean(isFirebaseConfigured && profile);
  const profileStudentId = profile?.role === ROLES.STUDENT ? getProfileStudentId(profile) : "";

  useEffect(() => {
    if (!usesFirestoreStudents) {
      setIsLoadingStudents(false);
      return undefined;
    }

    setIsLoadingStudents(true);

    if (profile.role === ROLES.STUDENT) {
      if (!profileStudentId) {
        setStudents([]);
        setIsLoadingStudents(false);
        return undefined;
      }

      return subscribeToStudentRecord(
        profileStudentId,
        (student) => {
          setStudents(student ? [student] : []);
          setStudentError("");
          setIsLoadingStudents(false);
        },
        (error) => {
          setStudentError(error.message);
          setIsLoadingStudents(false);
        },
      );
    }

    return subscribeToStudentRecords(
      (nextStudents) => {
        setStudents(nextStudents);
        setStudentError("");
        setIsLoadingStudents(false);
      },
      (error) => {
        setStudentError(error.message);
        setIsLoadingStudents(false);
      },
    );
  }, [profile?.role, profileStudentId, usesFirestoreStudents]);

  useEffect(() => {
    if (!usesFirestoreStudents || profile.role !== ROLES.ADMIN) {
      setUserProfiles(profile ? [profile] : []);
      setIsLoadingUsers(false);
      return undefined;
    }

    setIsLoadingUsers(true);

    return subscribeToUserProfiles(
      (nextProfiles) => {
        setUserProfiles(nextProfiles);
        setUserError("");
        setIsLoadingUsers(false);
      },
      (error) => {
        setUserError(error.message);
        setIsLoadingUsers(false);
      },
    );
  }, [profile, usesFirestoreStudents]);

  useEffect(() => {
    if (!usesFirestoreStudents) {
      setIsLoadingFees(false);
      return undefined;
    }

    if (profile.role === ROLES.STUDENT && !profileStudentId) {
      setFeeRecords([]);
      setIsLoadingFees(false);
      return undefined;
    }

    setIsLoadingFees(true);

    return subscribeToFeeRecords(
      profile.role === ROLES.STUDENT ? { studentId: profileStudentId } : {},
      (nextRecords) => {
        setFeeRecords(nextRecords);
        setFeeError("");
        setIsLoadingFees(false);
      },
      (error) => {
        setFeeError(error.message);
        setIsLoadingFees(false);
      },
    );
  }, [profile?.role, profileStudentId, usesFirestoreStudents]);

  useEffect(() => {
    if (!usesFirestoreStudents) {
      setIsLoadingAttendance(false);
      return undefined;
    }

    if (profile.role === ROLES.STUDENT && !profileStudentId) {
      setAttendanceRecords([]);
      setIsLoadingAttendance(false);
      return undefined;
    }

    setIsLoadingAttendance(true);

    return subscribeToAttendanceRecords(
      profile.role === ROLES.STUDENT ? { studentId: profileStudentId } : {},
      (nextRecords) => {
        setAttendanceRecords(nextRecords);
        setAttendanceError("");
        setIsLoadingAttendance(false);
      },
      (error) => {
        setAttendanceError(error.message);
        setIsLoadingAttendance(false);
      },
    );
  }, [profile?.role, profileStudentId, usesFirestoreStudents]);

  async function updateAttendance(studentId, attendanceStatus) {
    setAttendanceError("");
    const nextRecord = createAttendanceRecord({
      studentId,
      date: attendanceDate,
      status: attendanceStatus,
    });

    if (usesFirestoreStudents) {
      try {
        await saveAttendanceRecord(nextRecord);
      } catch (error) {
        setAttendanceError(error.message);
      }
      return;
    }

    setAttendanceRecords((currentRecords) => upsertAttendanceRecord(currentRecords, nextRecord));

    if (attendanceDate !== getLocalDateKey()) {
      return;
    }

    setStudents((currentStudents) =>
      updateStudentRecord(currentStudents, studentId, { attendanceStatus }),
    );
  }

  async function updateAllAttendance(attendanceStatus) {
    setAttendanceError("");
    const nextRecords = students.map((student) =>
      createAttendanceRecord({
        studentId: student.id,
        date: attendanceDate,
        status: attendanceStatus,
      }),
    );

    if (usesFirestoreStudents) {
      try {
        await Promise.all(nextRecords.map(saveAttendanceRecord));
      } catch (error) {
        setAttendanceError(error.message);
      }
      return;
    }

    setAttendanceRecords((currentRecords) =>
      nextRecords.reduce(upsertAttendanceRecord, currentRecords),
    );

    if (attendanceDate !== getLocalDateKey()) {
      return;
    }

    setStudents((currentStudents) =>
      currentStudents.map((student) => ({ ...student, attendanceStatus })),
    );
  }

  async function updateFeeStatus(studentId, status, paymentDate = getLocalDateKey(), updates = {}) {
    setFeeError("");
    setFeeNotice("");
    const student = students.find((record) => record.id === studentId);
    const amount = Number(updates.amount ?? student?.feeAmount ?? 0);
    const amountPaid = Number(
      updates.amountPaid ?? (status === "paid" ? amount : status === "pending" ? 0 : 0),
    );
    const nextRecord = createFeeRecord({
      studentId,
      studentName: updates.studentName || student?.name || studentId,
      month: feeMonth,
      amount,
      amountPaid,
      status,
      paymentDate: amountPaid > 0 ? paymentDate : "",
      notes: updates.notes || "",
      updatedBy: profile?.name || profile?.email || profile?.uid || "Local user",
    });

    if (usesFirestoreStudents) {
      try {
        await saveFeeRecord(nextRecord);
        setFeeNotice(
          nextRecord.status === "paid"
            ? `${nextRecord.studentName} marked paid for ${formatMonth(feeMonth)}.`
            : `${nextRecord.studentName} fee record saved with ${formatCurrency(nextRecord.dueAmount)} due.`,
        );
      } catch (error) {
        setFeeError(error.message);
      }
      return;
    }

    setFeeRecords((currentRecords) => upsertFeeRecord(currentRecords, nextRecord));
    setFeeNotice(
      nextRecord.status === "paid"
        ? `${nextRecord.studentName} marked paid locally.`
        : `${nextRecord.studentName} fee record saved locally.`,
    );
  }

  function startEditing(student) {
    setEditingStudentId(student.id);
    setStudentForm({
      ...student,
      feeAmount: String(student.feeAmount),
    });
  }

  function resetStudentForm() {
    setEditingStudentId(null);
    setStudentForm(getDefaultStudentForm());
  }

  function startEditingUser(userProfile) {
    setEditingUserId(userProfile.uid);
    setUserForm({
      ...getDefaultUserForm(),
      ...userProfile,
      studentId: userProfile.studentId || "",
    });
    setUserError("");
    setUserNotice("");
  }

  function resetUserForm() {
    setEditingUserId(null);
    setUserForm(getDefaultUserForm());
  }

  async function submitStudentForm(event) {
    event.preventDefault();
    setStudentError("");
    setStudentNotice("");

    const normalizedStudent = createStudentRecord({
      ...studentForm,
      feeAmount: Number(studentForm.feeAmount),
      attendanceRate: Number(studentForm.attendanceRate),
    });

    if (usesFirestoreStudents) {
      setIsSavingStudent(true);

      try {
        await saveStudentRecord({
          ...normalizedStudent,
          id: editingStudentId || normalizedStudent.id,
        });
        setStudentNotice(editingStudentId ? "Student updated." : "Student added.");
        resetStudentForm();
      } catch (error) {
        setStudentError(error.message);
      } finally {
        setIsSavingStudent(false);
      }
      return;
    }

    if (editingStudentId) {
      setStudents((currentStudents) =>
        updateStudentRecord(currentStudents, editingStudentId, normalizedStudent),
      );
      setStudentNotice("Student updated locally.");
    } else {
      setStudents((currentStudents) => [...currentStudents, normalizedStudent]);
      setStudentNotice("Student added locally.");
    }

    resetStudentForm();
  }

  async function deleteStudent(studentId) {
    setStudentError("");
    setStudentNotice("");

    if (usesFirestoreStudents) {
      try {
        await deleteStudentRecord(studentId);
        setStudentNotice("Student deleted.");

        if (editingStudentId === studentId) {
          resetStudentForm();
        }
      } catch (error) {
        setStudentError(error.message);
      }
      return;
    }

    setStudents((currentStudents) => removeStudentRecord(currentStudents, studentId));
    setStudentNotice("Student deleted locally.");
  }

  async function submitUserForm(event) {
    event.preventDefault();
    setUserError("");
    setUserNotice("");

    if (editingUserId === profile?.uid && userForm.role !== ROLES.ADMIN) {
      setUserError("You cannot remove your own admin access.");
      return;
    }

    setIsSavingUser(true);

    try {
      await saveUserProfile({
        ...userForm,
        uid: editingUserId || userForm.uid,
      });
      setUserNotice(editingUserId ? "User profile updated." : "User profile added.");
      resetUserForm();
    } catch (error) {
      setUserError(error.message);
    } finally {
      setIsSavingUser(false);
    }
  }

  async function submitStudentAccountForm(event) {
    event.preventDefault();
    setStudentAccountError("");
    setStudentAccountNotice("");
    setIsCreatingStudentAccount(true);

    try {
      const createdAccount = await createStudentAccount(studentAccountForm);
      setStudentAccountNotice(
        `${createdAccount.name} student account created. UID: ${createdAccount.uid}`,
      );
      setStudentAccountForm(getDefaultStudentAccountForm());
    } catch (error) {
      setStudentAccountError(error.message);
    } finally {
      setIsCreatingStudentAccount(false);
    }
  }

  async function deleteUser(uid) {
    setUserError("");
    setUserNotice("");

    if (uid === profile?.uid) {
      setUserError("You cannot delete your own user profile.");
      return;
    }

    try {
      await deleteUserProfile(uid);
      setUserNotice("User profile deleted.");

      if (editingUserId === uid) {
        resetUserForm();
      }
    } catch (error) {
      setUserError(error.message);
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/" element={<RoleRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route
          path="/admin/*"
          element={
            <ManagementPortal
              role={ROLES.ADMIN}
              batches={snapshot.batches}
              students={students}
              attendanceDate={attendanceDate}
              attendanceError={attendanceError}
              attendanceRecords={attendanceRecords}
              feeError={feeError}
              feeMonth={feeMonth}
              feeNotice={feeNotice}
              feeRecords={feeRecords}
              userProfiles={userProfiles}
              studentAccountForm={studentAccountForm}
              studentForm={studentForm}
              userForm={userForm}
              editingStudentId={editingStudentId}
              editingUserId={editingUserId}
              isLoadingAttendance={isLoadingAttendance}
              isLoadingFees={isLoadingFees}
              isLoadingStudents={isLoadingStudents}
              isLoadingUsers={isLoadingUsers}
              isCreatingStudentAccount={isCreatingStudentAccount}
              isSavingStudent={isSavingStudent}
              isSavingUser={isSavingUser}
              studentError={studentError}
              studentAccountError={studentAccountError}
              userError={userError}
              onAttendanceChange={updateAttendance}
              studentNotice={studentNotice}
              studentAccountNotice={studentAccountNotice}
              userNotice={userNotice}
              onAttendanceDateChange={setAttendanceDate}
              onFeeMonthChange={setFeeMonth}
              onMarkAll={updateAllAttendance}
              onUpdateFeeStatus={updateFeeStatus}
              onFormChange={setStudentForm}
              onStudentAccountFormChange={setStudentAccountForm}
              onUserFormChange={setUserForm}
              onSubmitStudent={submitStudentForm}
              onSubmitStudentAccount={submitStudentAccountForm}
              onSubmitUser={submitUserForm}
              onCancelStudent={resetStudentForm}
              onCancelUser={resetUserForm}
              onEditStudent={startEditing}
              onEditUser={startEditingUser}
              onDeleteStudent={deleteStudent}
              onDeleteUser={deleteUser}
            />
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.COACH]} />}>
        <Route
          path="/coach/*"
          element={
            <ManagementPortal
              role={ROLES.COACH}
              batches={snapshot.batches}
              students={students}
              attendanceDate={attendanceDate}
              attendanceError={attendanceError}
              attendanceRecords={attendanceRecords}
              feeError={feeError}
              feeMonth={feeMonth}
              feeNotice={feeNotice}
              feeRecords={feeRecords}
              userProfiles={userProfiles}
              isLoadingAttendance={isLoadingAttendance}
              isLoadingFees={isLoadingFees}
              onAttendanceChange={updateAttendance}
              onAttendanceDateChange={setAttendanceDate}
              onFeeMonthChange={setFeeMonth}
              onMarkAll={updateAllAttendance}
              onUpdateFeeStatus={updateFeeStatus}
            />
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route
          path="/student/*"
          element={
            <StudentDashboardErrorBoundary>
              <StudentPortal
                attendanceRecords={attendanceRecords}
                attendanceError={attendanceError}
                feeRecords={feeRecords}
                feeError={feeError}
                batches={snapshot.batches}
                isLoadingAttendance={isLoadingAttendance}
                isLoadingFees={isLoadingFees}
                isLoadingStudents={isLoadingStudents}
                studentError={studentError}
                students={students}
              />
            </StudentDashboardErrorBoundary>
          }
        />
      </Route>

      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

function RoleRedirect() {
  const { loading, profile } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Navigate to={profile ? getRoleHomePath(profile.role) : "/login"} replace />;
}

class StudentDashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-academy-black px-4 py-6 text-white sm:px-6 md:px-8">
          <section className="surface mx-auto max-w-3xl p-4">
            <p className="section-title">Student portal</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Student dashboard could not render
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              The student route loaded, but one dashboard component failed during render.
            </p>
            <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
              {this.state.error.message || "Unknown render error"}
            </p>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

function ManagementPortal({
  role,
  batches,
  students,
  attendanceDate,
  attendanceError,
  attendanceRecords,
  feeError,
  feeMonth,
  feeNotice,
  feeRecords,
  userProfiles,
  studentAccountForm,
  studentForm,
  userForm,
  editingStudentId,
  editingUserId,
  isLoadingAttendance,
  isLoadingFees,
  isLoadingStudents,
  isLoadingUsers,
  isCreatingStudentAccount,
  isSavingStudent,
  isSavingUser,
  studentAccountError,
  studentError,
  userError,
  studentAccountNotice,
  studentNotice,
  userNotice,
  onAttendanceChange,
  onAttendanceDateChange,
  onFeeMonthChange,
  onMarkAll,
  onUpdateFeeStatus,
  onFormChange,
  onStudentAccountFormChange,
  onUserFormChange,
  onSubmitStudent,
  onSubmitStudentAccount,
  onSubmitUser,
  onCancelStudent,
  onCancelUser,
  onEditStudent,
  onEditUser,
  onDeleteStudent,
  onDeleteUser,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, profile } = useAuth();
  const permissions = PERMISSIONS[role];
  const activeView = location.pathname.split("/")[2] || roleViews[role][0];

  if (!roleViews[role].includes(activeView)) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  const metrics = getMetrics(students, attendanceRecords, feeRecords, getLocalDateKey(), getLocalMonthKey());
  const navigation = buildNavigation(role, permissions);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function handleNavigate(view) {
    navigate(`/${role}/${view}`);
  }

  return (
    <AppShell
      currentUser={profile}
      activeView={activeView}
      navigation={navigation}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {activeView === "dashboard" && role === ROLES.ADMIN && (
        <DashboardOverview
          attendanceRecords={attendanceRecords}
          feeRecords={feeRecords}
          metrics={metrics}
          students={students}
          batches={batches}
        />
      )}
      {activeView === "attendance" && (
        <AttendanceView
          attendanceDate={attendanceDate}
          attendanceError={attendanceError}
          attendanceRecords={attendanceRecords}
          students={students}
          batches={batches}
          isLoadingAttendance={isLoadingAttendance}
          onAttendanceChange={onAttendanceChange}
          onAttendanceDateChange={onAttendanceDateChange}
          onMarkAll={onMarkAll}
        />
      )}
      {activeView === "attendance-history" && (
        <AttendanceHistoryView
          attendanceRecords={attendanceRecords}
          batches={batches}
          isLoadingAttendance={isLoadingAttendance}
          students={students}
        />
      )}
      {activeView === "fees" && (
        <FeesView
          feeError={feeError}
          feeMonth={feeMonth}
          feeNotice={feeNotice}
          feeRecords={feeRecords}
          students={students}
          batches={batches}
          isLoadingFees={isLoadingFees}
          onFeeMonthChange={onFeeMonthChange}
          onUpdateFeeStatus={onUpdateFeeStatus}
        />
      )}
      {activeView === "students" && permissions.canViewStudents && (
        <StudentsView
          students={students}
          batches={batches}
          canManageStudents={permissions.canManageStudents}
          studentForm={studentForm}
          editingStudentId={editingStudentId}
          isLoadingStudents={isLoadingStudents}
          isSavingStudent={isSavingStudent}
          studentError={studentError}
          studentNotice={studentNotice}
          onFormChange={onFormChange}
          onSubmit={onSubmitStudent}
          onCancel={onCancelStudent}
          onAttendanceChange={onAttendanceChange}
          onEdit={onEditStudent}
          onDelete={onDeleteStudent}
        />
      )}
      {activeView === "reports" && permissions.canViewReports && (
        <ReportsView
          attendanceRecords={attendanceRecords}
          batches={batches}
          feeRecords={feeRecords}
          role={role}
          students={students}
        />
      )}
      {activeView === "users" && permissions.canManageUsers && (
        <UsersManagementView
          currentUserId={profile.uid}
          batches={batches}
          editingUserId={editingUserId}
          isCreatingStudentAccount={isCreatingStudentAccount}
          isLoadingUsers={isLoadingUsers}
          isSavingUser={isSavingUser}
          onCancel={onCancelUser}
          onDelete={onDeleteUser}
          onEdit={onEditUser}
          onFormChange={onUserFormChange}
          onStudentAccountFormChange={onStudentAccountFormChange}
          onSubmitStudentAccount={onSubmitStudentAccount}
          onSubmit={onSubmitUser}
          studentAccountError={studentAccountError}
          studentAccountForm={studentAccountForm}
          studentAccountNotice={studentAccountNotice}
          userError={userError}
          userForm={userForm}
          userNotice={userNotice}
          users={userProfiles}
        />
      )}
      {activeView === "settings" && permissions.canAccessSettings && <SettingsView />}
    </AppShell>
  );
}

function StudentPortal({
  attendanceRecords,
  attendanceError,
  batches,
  feeRecords,
  feeError,
  isLoadingAttendance,
  isLoadingFees,
  isLoadingStudents,
  studentError,
  students,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, profile } = useAuth();
  const activeView = location.pathname.split("/")[2] || "overview";
  const studentId = getProfileStudentId(profile);
  const student = students.find((record) => record.id === studentId);

  if (import.meta.env.DEV) {
    console.debug("[StudentPortal]", {
      activeView,
      hasStudentDocument: Boolean(student),
      studentId,
      studentsLoaded: students.length,
    });
  }

  if (!roleViews[ROLES.STUDENT].includes(activeView)) {
    return <Navigate to={getRoleHomePath(ROLES.STUDENT)} replace />;
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <AppShell
      currentUser={profile}
      activeView={activeView}
      navigation={[{ id: "overview", label: "Overview" }]}
      onNavigate={() => navigate(getRoleHomePath(ROLES.STUDENT))}
      onLogout={handleLogout}
    >
      <StudentDashboardErrorBoundary>
        <StudentOverview
          attendanceRecords={attendanceRecords}
          attendanceError={attendanceError}
          batches={batches}
          feeRecords={feeRecords}
          feeError={feeError}
          isLoading={isLoadingStudents || isLoadingAttendance || isLoadingFees}
          student={student}
          studentError={studentError}
          studentId={studentId}
        />
      </StudentDashboardErrorBoundary>
    </AppShell>
  );
}

function buildNavigation(role, permissions) {
  if (role === ROLES.COACH) {
    return [
      { id: "attendance", label: "Attendance" },
      { id: "attendance-history", label: "History" },
      { id: "fees", label: "Fees" },
      { id: "students", label: "Students" },
      { id: "reports", label: "Reports" },
    ];
  }

  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "attendance", label: "Attendance" },
    { id: "attendance-history", label: "History" },
    { id: "fees", label: "Fees" },
  ];

  if (permissions.canViewStudents) {
    items.push({ id: "students", label: "Students" });
  }

  if (permissions.canViewReports) {
    items.push({ id: "reports", label: "Reports" });
  }

  if (permissions.canManageUsers) {
    items.push({ id: "users", label: "Users" });
  }

  if (permissions.canAccessSettings) {
    items.push({ id: "settings", label: "Settings" });
  }

  return items;
}

function getMetrics(students, attendanceRecords, feeRecords, todayDate, month) {
  const activeStudentIds = new Set(students.map((student) => student.id));
  const presentToday = attendanceRecords.filter(
    (record) =>
      activeStudentIds.has(record.studentId) &&
      record.date === todayDate &&
      record.status === "present",
  ).length;
  const feeRows = getMonthlyFeeRows(students, feeRecords, month);
  const feeSummary = getFeeSummary(feeRows);

  return {
    totalStudents: students.length,
    presentToday,
    pendingFees: feeSummary.pendingTotal,
    monthlyIncome: feeSummary.monthlyIncome,
    pendingFeesCount: feeSummary.pendingCount,
    paidStudentsCount: feeSummary.paidCount,
    monthlyCollectionSummary: `${formatCurrency(feeSummary.monthlyIncome)} / ${formatCurrency(
      feeSummary.expectedTotal,
    )}`,
  };
}

function getFeeSummary(rows) {
  return rows.reduce(
    (summary, row) => ({
      expectedTotal: summary.expectedTotal + row.amount,
      monthlyIncome: summary.monthlyIncome + row.amountPaid,
      pendingTotal: summary.pendingTotal + row.dueAmount,
      paidCount: summary.paidCount + (row.status === "paid" ? 1 : 0),
      pendingCount: summary.pendingCount + (row.dueAmount > 0 ? 1 : 0),
    }),
    {
      expectedTotal: 0,
      monthlyIncome: 0,
      pendingTotal: 0,
      paidCount: 0,
      pendingCount: 0,
    },
  );
}

function getMonthlyFeeRows(students, feeRecords, month) {
  return students.map((student) => {
    const record = feeRecords.find((item) => item.studentId === student.id && item.month === month);
    const amount = record?.amount ?? student.feeAmount;
    const amountPaid = record?.amountPaid ?? (record?.status === "paid" ? amount : 0);
    const dueAmount = record?.dueAmount ?? Math.max(amount - amountPaid, 0);

    return {
      id: record?.id || `${student.id}_${month}`,
      student,
      studentId: student.id,
      studentName: record?.studentName || student.name,
      month,
      amount,
      amountPaid,
      dueAmount,
      status: record?.status || (dueAmount <= 0 ? "paid" : "pending"),
      paymentDate: record?.paymentDate || "",
      notes: record?.notes || "",
      updatedBy: record?.updatedBy || "",
      timestamp: record?.timestamp || null,
      isSaved: Boolean(record),
    };
  });
}

function getFeeHistoryRows(students, feeRecords) {
  return feeRecords.map((record) => ({
    ...record,
    student: students.find((student) => student.id === record.studentId),
    studentName:
      record.studentName || students.find((student) => student.id === record.studentId)?.name || record.studentId,
  }));
}

function getPercentage(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function getMonthKeyFromDate(value) {
  return value ? String(value).slice(0, 7) : "";
}

function getMonthRange(monthCount = 6, endDate = new Date()) {
  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(endDate.getFullYear(), endDate.getMonth() - (monthCount - 1 - index), 1);
    return getLocalMonthKey(date);
  });
}

function getStudentAttendanceRows(students, attendanceRecords, month) {
  return students
    .map((student) => {
      const records = attendanceRecords.filter(
        (record) => record.studentId === student.id && getMonthKeyFromDate(record.date) === month,
      );
      const present = records.filter((record) => record.status === "present").length;
      const absent = records.filter((record) => record.status === "absent").length;

      return {
        student,
        marked: records.length,
        present,
        absent,
        percentage: getPercentage(present, records.length),
      };
    })
    .sort((first, second) => second.percentage - first.percentage || first.student.name.localeCompare(second.student.name));
}

function getBatchAttendanceRows(batches, students, attendanceRecords, month) {
  return batches.map((batch) => {
    const batchStudentIds = new Set(
      students.filter((student) => student.batchId === batch.id).map((student) => student.id),
    );
    const records = attendanceRecords.filter(
      (record) =>
        batchStudentIds.has(record.studentId) && getMonthKeyFromDate(record.date) === month,
    );
    const present = records.filter((record) => record.status === "present").length;
    const absent = records.filter((record) => record.status === "absent").length;

    return {
      ...batch,
      totalStudents: batchStudentIds.size,
      marked: records.length,
      present,
      absent,
      percentage: getPercentage(present, records.length),
    };
  });
}

function getMonthlyAnalytics(students, attendanceRecords, feeRecords, month) {
  const attendanceRows = attendanceRecords.filter(
    (record) => getMonthKeyFromDate(record.date) === month,
  );
  const present = attendanceRows.filter((record) => record.status === "present").length;
  const absent = attendanceRows.filter((record) => record.status === "absent").length;
  const feeRows = getMonthlyFeeRows(students, feeRecords, month);
  const feeSummary = getFeeSummary(feeRows);
  const newAdmissions = students.filter((student) => getMonthKeyFromDate(student.joinDate) === month).length;

  return {
    attendancePercentage: getPercentage(present, attendanceRows.length),
    present,
    absent,
    markedAttendance: attendanceRows.length,
    activeStudents: students.length,
    newAdmissions,
    feeRows,
    feeSummary,
  };
}

function getRevenueTrendRows(students, feeRecords, months) {
  return months.map((month) => {
    const feeSummary = getFeeSummary(getMonthlyFeeRows(students, feeRecords, month));

    return {
      month,
      income: feeSummary.monthlyIncome,
      pending: feeSummary.pendingTotal,
      expected: feeSummary.expectedTotal,
    };
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function openPrintableReport(title, sections) {
  const printableWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printableWindow) {
    return false;
  }

  const body = sections
    .map(
      (section) => `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          <table>
            <thead>
              <tr>${section.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${section.rows
                .map(
                  (row) =>
                    `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </section>
      `,
    )
    .join("");

  printableWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
          h1 { margin: 0 0 8px; }
          h2 { margin: 28px 0 12px; }
          p { color: #555; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
          th, td { border: 1px solid #d7d7d7; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Generated from Archery Academy live reports</p>
        ${body}
      </body>
    </html>
  `);
  printableWindow.document.close();
  printableWindow.focus();
  printableWindow.print();

  return true;
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getAttendanceStatusForDate(attendanceRecords, studentId, date, fallback = "") {
  return (
    attendanceRecords.find((record) => record.studentId === studentId && record.date === date)
      ?.status || fallback
  );
}

function getAttendanceSummary(attendanceRecords, date, students = []) {
  const activeStudentIds = new Set(students.map((student) => student.id));
  const recordsForDate = attendanceRecords.filter(
    (record) =>
      record.date === date && (!activeStudentIds.size || activeStudentIds.has(record.studentId)),
  );

  return {
    marked: recordsForDate.length,
    present: recordsForDate.filter((record) => record.status === "present").length,
    absent: recordsForDate.filter((record) => record.status === "absent").length,
  };
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
      {status}
    </span>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-academy-black text-neutral-300">
      Loading academy access...
    </div>
  );
}

function DashboardOverview({ attendanceRecords, feeRecords, metrics, students, batches }) {
  const recentStudents = students.slice(0, 4);
  const todayDate = getLocalDateKey();

  return (
    <div className="space-y-8">
      <section>
        <p className="section-title">Dashboard</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardCard
            icon={Users}
            label="Total students"
            value={metrics.totalStudents}
            helper="Active academy roster"
          />
          <DashboardCard
            icon={CalendarDays}
            label="Today's attendance"
            value={`${metrics.presentToday}/${metrics.totalStudents}`}
            helper="Students marked present"
          />
          <DashboardCard
            icon={ClipboardCheck}
            label="Pending fees"
            value={formatCurrency(metrics.pendingFees)}
            helper={`${metrics.pendingFeesCount} students with dues`}
          />
          <DashboardCard
            icon={CircleDollarSign}
            label="Paid students"
            value={`${metrics.paidStudentsCount}/${metrics.totalStudents}`}
            helper="Current month"
          />
          <DashboardCard
            icon={TrendingUp}
            label="Monthly income"
            value={formatCurrency(metrics.monthlyIncome)}
            helper={metrics.monthlyCollectionSummary}
          />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="section-title">Roster pulse</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Quick student snapshot</h2>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {recentStudents.map((student) => {
            const batch = getBatchById(batches, student.batchId);
            const feeRecord = feeRecords.find(
              (record) => record.studentId === student.id && record.month === getLocalMonthKey(),
            );
            const todayStatus = getAttendanceStatusForDate(
              attendanceRecords,
              student.id,
              todayDate,
              "not marked",
            );

            return (
              <div key={student.id} className="surface flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm text-neutral-500">{student.id}</p>
                  <p className="mt-1 font-medium text-white">{student.name}</p>
                  <p className="mt-1 text-sm text-neutral-400">{batch?.name}</p>
                </div>
                <div className="text-right">
                  <FeeStatusBadge status={feeRecord?.status || "pending"} />
                  <p className="mt-3 text-sm capitalize text-neutral-300">
                    {todayStatus}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AttendanceView({
  attendanceDate,
  attendanceError,
  attendanceRecords,
  students,
  batches,
  isLoadingAttendance,
  onAttendanceChange,
  onAttendanceDateChange,
  onMarkAll,
}) {
  const summary = getAttendanceSummary(attendanceRecords, attendanceDate, students);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-title">Attendance</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Daily marking</h2>
          <p className="mt-2 text-sm text-neutral-400">
            {summary.present} present, {summary.absent} absent, {summary.marked}/{students.length}{" "}
            marked
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_auto_auto] sm:items-end">
          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Date</span>
            <input
              className="field w-full"
              type="date"
              value={attendanceDate}
              onChange={(event) => onAttendanceDateChange(event.target.value)}
            />
          </label>
          <button type="button" className="gold-button min-h-11" onClick={() => onMarkAll("present")}>
            Mark all present
          </button>
          <button type="button" className="ghost-button min-h-11" onClick={() => onMarkAll("absent")}>
            Mark all absent
          </button>
        </div>
      </section>

      {attendanceError && (
        <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
          {attendanceError}
        </p>
      )}

      {isLoadingAttendance ? (
        <div className="surface p-4 text-sm text-neutral-400">Loading attendance...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => {
            const status = getAttendanceStatusForDate(attendanceRecords, student.id, attendanceDate);

            return (
              <StudentCard
                key={student.id}
                student={{ ...student, attendanceStatus: status }}
                batch={getBatchById(batches, student.batchId)}
                canManageAttendance
                canManageStudents={false}
                onAttendanceChange={onAttendanceChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function AttendanceHistoryView({ attendanceRecords, batches, isLoadingAttendance, students }) {
  const rows = attendanceRecords.map((record) => {
    const student = students.find((item) => item.id === record.studentId);

    return {
      ...record,
      batch: getBatchById(batches, student?.batchId),
      student,
    };
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Attendance</p>
          <h2 className="mt-2 text-xl font-semibold text-white">History</h2>
        </div>
        <p className="text-sm text-neutral-400">{rows.length} records</p>
      </section>

      {isLoadingAttendance ? (
        <div className="surface p-4 text-sm text-neutral-400">Loading attendance history...</div>
      ) : rows.length === 0 ? (
        <div className="surface p-4 text-sm text-neutral-400">
          No attendance has been marked yet.
        </div>
      ) : (
        <>
          <div className="surface hidden overflow-hidden md:block">
            <div className="grid grid-cols-[0.8fr_1fr_1fr_0.8fr] gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
              <span>Date</span>
              <span>Student</span>
              <span>Batch</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-white/5">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[0.8fr_1fr_1fr_0.8fr] items-center gap-4 px-4 py-4 text-sm"
                >
                  <span className="text-white">{formatDate(row.date)}</span>
                  <span>
                    <span className="block font-medium text-white">
                      {row.student?.name || row.studentId}
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">{row.studentId}</span>
                  </span>
                  <span className="text-neutral-300">{row.batch?.name || "Not assigned"}</span>
                  <AttendanceStatusBadge status={row.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <article key={row.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      {formatDate(row.date)}
                    </p>
                    <h3 className="mt-2 font-semibold text-white">
                      {row.student?.name || row.studentId}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-400">{row.batch?.name}</p>
                  </div>
                  <AttendanceStatusBadge status={row.status} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeesView({
  feeError,
  feeMonth,
  feeNotice,
  feeRecords,
  students,
  batches,
  isLoadingFees,
  onFeeMonthChange,
  onUpdateFeeStatus,
}) {
  const [feeSearch, setFeeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [draftRecords, setDraftRecords] = useState({});
  const monthlyRows = getMonthlyFeeRows(students, feeRecords, feeMonth);
  const summary = getFeeSummary(monthlyRows);
  const normalizedSearch = feeSearch.trim().toLowerCase();
  const filteredMonthlyRows = monthlyRows.filter((row) => {
    const batch = getBatchById(batches, row.student.batchId);
    const searchText = `${row.student.name} ${row.student.id} ${batch?.name || ""}`.toLowerCase();
    const matchesSearch = !normalizedSearch || searchText.includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const historyRows = getFeeHistoryRows(students, feeRecords).filter((row) => {
    const searchText = `${row.studentName} ${row.studentId}`.toLowerCase();
    return row.month === feeMonth && (!normalizedSearch || searchText.includes(normalizedSearch));
  });

  function updateDraft(rowId, patch) {
    setDraftRecords((currentDrafts) => ({
      ...currentDrafts,
      [rowId]: {
        ...currentDrafts[rowId],
        ...patch,
      },
    }));
  }

  function clearDraft(rowId) {
    setDraftRecords((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[rowId];
      return nextDrafts;
    });
  }

  function getEditableFeeRow(row) {
    const draft = draftRecords[row.id] || {};
    const amount = Number(draft.amount ?? row.amount);
    const amountPaid = Math.min(Math.max(Number(draft.amountPaid ?? row.amountPaid) || 0, 0), amount);
    const dueAmount = Math.max(amount - amountPaid, 0);

    return {
      ...row,
      ...draft,
      amount,
      amountPaid,
      dueAmount,
      status: dueAmount === 0 ? "paid" : "pending",
      paymentDate: draft.paymentDate ?? row.paymentDate,
      notes: draft.notes ?? row.notes,
    };
  }

  async function saveFeeRow(row, statusOverride) {
    const editableRow = getEditableFeeRow(row);
    const nextAmountPaid =
      statusOverride === "paid"
        ? editableRow.amount
        : statusOverride === "pending"
          ? 0
          : editableRow.amountPaid;
    const nextStatus =
      statusOverride || (nextAmountPaid >= editableRow.amount ? "paid" : "pending");
    const nextPaymentDate =
      nextStatus === "paid" || nextAmountPaid > 0
        ? editableRow.paymentDate || getLocalDateKey()
        : "";

    await onUpdateFeeStatus(row.studentId, nextStatus, nextPaymentDate, {
      amount: editableRow.amount,
      amountPaid: nextAmountPaid,
      notes: editableRow.notes,
      studentName: row.student.name,
    });
    clearDraft(row.id);
  }

  function exportFeeReport() {
    const rows = [
      [
        "Student ID",
        "Student Name",
        "Month",
        "Amount",
        "Amount Paid",
        "Due Amount",
        "Status",
        "Payment Date",
        "Notes",
        "Updated By",
      ],
      ...monthlyRows.map((row) => [
        row.studentId,
        row.studentName,
        row.month,
        row.amount,
        row.amountPaid,
        row.dueAmount,
        row.status,
        row.paymentDate || "",
        row.notes || "",
        row.updatedBy || "",
      ]),
    ];

    downloadCsv(`fee-report-${feeMonth}.csv`, rows);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-title">Fees</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Monthly fee register</h2>
          <p className="mt-2 text-sm text-neutral-400">
            {formatCurrency(summary.monthlyIncome)} collected,{" "}
            {formatCurrency(summary.pendingTotal)} pending for{" "}
            {formatMonth(feeMonth)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_auto] sm:items-end">
          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Fee month</span>
            <input
              className="field w-full"
              type="month"
              value={feeMonth}
              onChange={(event) => onFeeMonthChange(event.target.value)}
            />
          </label>
          <button type="button" className="ghost-button min-h-11" onClick={exportFeeReport}>
            <Download size={16} />
            Export report
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          icon={TrendingUp}
          label="Monthly income"
          value={formatCurrency(summary.monthlyIncome)}
          helper={`${summary.paidCount} paid students`}
        />
        <DashboardCard
          icon={ClipboardCheck}
          label="Pending dues"
          value={formatCurrency(summary.pendingTotal)}
          helper={`${summary.pendingCount} pending students`}
        />
        <DashboardCard
          icon={CircleDollarSign}
          label="Expected collection"
          value={formatCurrency(summary.expectedTotal)}
          helper={formatMonth(feeMonth)}
        />
        <DashboardCard
          icon={Users}
          label="Collection summary"
          value={`${summary.paidCount}/${students.length}`}
          helper="Students paid this month"
        />
      </div>

      <section className="surface grid gap-3 p-4 lg:grid-cols-[1fr_180px] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">Search students</span>
          <span className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              className="field w-full pl-10"
              placeholder="Search by name, ID, or batch"
              value={feeSearch}
              onChange={(event) => setFeeSearch(event.target.value)}
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">Status</span>
          <select
            className="field w-full"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </label>
      </section>

      {(feeError || feeNotice) && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            feeError
              ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
          }`}
        >
          {feeError || feeNotice}
        </p>
      )}

      {isLoadingFees ? (
        <div className="surface p-4 text-sm text-neutral-400">Loading fee records...</div>
      ) : filteredMonthlyRows.length === 0 ? (
        <div className="surface p-4 text-sm text-neutral-400">
          No students match the current fee filters.
        </div>
      ) : (
        <>
          <div className="surface overflow-hidden">
            <div className="hidden grid-cols-[1.05fr_0.75fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr] gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-neutral-500 xl:grid">
              <span>Student</span>
              <span>Batch</span>
              <span>Amount</span>
              <span>Paid</span>
              <span>Due</span>
              <span>Status</span>
              <span>Payment date</span>
              <span>Notes and actions</span>
            </div>
            <div className="divide-y divide-white/5">
              {filteredMonthlyRows.map((row) => {
                const batch = getBatchById(batches, row.student.batchId);
                const editableRow = getEditableFeeRow(row);

                return (
                  <div
                    key={row.id}
                    className="grid gap-3 px-4 py-4 xl:grid-cols-[1.05fr_0.75fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr] xl:items-start"
                  >
                    <div>
                      <p className="font-medium text-white">{row.student.name}</p>
                      <p className="mt-1 text-sm text-neutral-500">{row.student.id}</p>
                    </div>
                    <p className="text-sm text-neutral-300">{batch?.name}</p>
                    <p className="text-sm text-white">{formatCurrency(editableRow.amount)}</p>
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-neutral-500 xl:hidden">
                        Amount paid
                      </span>
                      <input
                        className="field h-10 w-full text-sm"
                        type="number"
                        min="0"
                        max={editableRow.amount}
                        value={draftRecords[row.id]?.amountPaid ?? row.amountPaid}
                        onChange={(event) => updateDraft(row.id, { amountPaid: event.target.value })}
                      />
                    </label>
                    <p className="text-sm font-medium text-white">
                      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-neutral-500 xl:hidden">
                        Due
                      </span>
                      {formatCurrency(editableRow.dueAmount)}
                    </p>
                    <FeeStatusBadge status={editableRow.status} />
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-neutral-500 lg:hidden">
                        Payment date
                      </span>
                      <input
                        className="field h-10 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        type="date"
                        value={draftRecords[row.id]?.paymentDate ?? row.paymentDate}
                        disabled={editableRow.amountPaid <= 0}
                        onChange={(event) => updateDraft(row.id, { paymentDate: event.target.value })}
                      />
                    </label>
                    <div className="space-y-2">
                      <textarea
                        className="field min-h-20 w-full resize-y text-sm"
                        placeholder="Payment notes"
                        value={draftRecords[row.id]?.notes ?? row.notes}
                        onChange={(event) => updateDraft(row.id, { notes: event.target.value })}
                      />
                      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                        <button
                          type="button"
                          className="ghost-button min-h-10"
                          onClick={() => saveFeeRow(row)}
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          type="button"
                          className="gold-button min-h-10"
                          onClick={() => saveFeeRow(row, "paid")}
                        >
                          Mark paid
                        </button>
                        <button
                          type="button"
                          className="ghost-button min-h-10"
                          onClick={() => saveFeeRow(row, "pending")}
                        >
                          Pending
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <section className="space-y-4">
            <div>
              <p className="section-title">Student fee history</p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Payment history for {formatMonth(feeMonth)}
              </h3>
            </div>

            {historyRows.length === 0 ? (
              <div className="surface p-4 text-sm text-neutral-400">
                No saved fee records for this month.
              </div>
            ) : (
              <>
                <div className="surface hidden overflow-hidden md:block">
                  <div className="grid grid-cols-[0.8fr_1fr_0.7fr_0.7fr_0.7fr_0.8fr_1fr] gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
                    <span>Month</span>
                    <span>Student</span>
                    <span>Amount</span>
                    <span>Paid</span>
                    <span>Due</span>
                    <span>Status</span>
                    <span>Notes</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {historyRows.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[0.8fr_1fr_0.7fr_0.7fr_0.7fr_0.8fr_1fr] items-center gap-4 px-4 py-4 text-sm"
                      >
                        <span className="text-white">{formatMonth(row.month)}</span>
                        <span>
                          <span className="block font-medium text-white">
                            {row.studentName || row.studentId}
                          </span>
                          <span className="mt-1 block text-xs text-neutral-500">
                            {row.studentId}
                          </span>
                        </span>
                        <span className="text-white">{formatCurrency(row.amount)}</span>
                        <span className="text-white">{formatCurrency(row.amountPaid)}</span>
                        <span className="text-white">{formatCurrency(row.dueAmount)}</span>
                        <FeeStatusBadge status={row.status} />
                        <span className="text-neutral-300">
                          {row.notes || (row.paymentDate ? formatDate(row.paymentDate) : "No notes")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:hidden">
                  {historyRows.map((row) => (
                    <article key={row.id} className="surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                            {formatMonth(row.month)}
                          </p>
                          <h3 className="mt-2 font-semibold text-white">
                            {row.studentName || row.studentId}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-400">
                            Paid {formatCurrency(row.amountPaid)} of {formatCurrency(row.amount)}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            Due {formatCurrency(row.dueAmount)}
                          </p>
                          {row.notes && (
                            <p className="mt-2 text-sm text-neutral-300">{row.notes}</p>
                          )}
                        </div>
                        <FeeStatusBadge status={row.status} />
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function formatProfileCreatedAt(value) {
  if (!value) {
    return "Not added";
  }

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function UsersManagementView({
  batches,
  currentUserId,
  editingUserId,
  isCreatingStudentAccount,
  isLoadingUsers,
  isSavingUser,
  onCancel,
  onDelete,
  onEdit,
  onFormChange,
  onStudentAccountFormChange,
  onSubmitStudentAccount,
  onSubmit,
  studentAccountError,
  studentAccountForm,
  studentAccountNotice,
  userError,
  userForm,
  userNotice,
  users,
}) {
  const showStudentLink = userForm.role === ROLES.STUDENT;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Users</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Role access</h2>
        </div>
        <p className="text-sm text-neutral-400">{users.length} profiles</p>
      </section>

      <form className="surface space-y-5 p-4" onSubmit={onSubmitStudentAccount}>
        <div>
          <p className="section-title">Create Student Account</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Auth + profile setup</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Creates the Firebase Auth login, users UID profile, and students UID dashboard record.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Student email</span>
            <input
              className="field w-full"
              type="email"
              placeholder="student@academy.com"
              value={studentAccountForm.email}
              onChange={(event) =>
                onStudentAccountFormChange({ ...studentAccountForm, email: event.target.value })
              }
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Password</span>
            <input
              className="field w-full"
              type="password"
              minLength={6}
              placeholder="Minimum 6 characters"
              value={studentAccountForm.password}
              onChange={(event) =>
                onStudentAccountFormChange({
                  ...studentAccountForm,
                  password: event.target.value,
                })
              }
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Student name</span>
            <input
              className="field w-full"
              placeholder="Full name"
              value={studentAccountForm.name}
              onChange={(event) =>
                onStudentAccountFormChange({ ...studentAccountForm, name: event.target.value })
              }
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Batch</span>
            <select
              className="field w-full"
              value={studentAccountForm.batchId}
              onChange={(event) =>
                onStudentAccountFormChange({ ...studentAccountForm, batchId: event.target.value })
              }
              required
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Parent name</span>
            <input
              className="field w-full"
              placeholder="Parent or guardian"
              value={studentAccountForm.parentName}
              onChange={(event) =>
                onStudentAccountFormChange({
                  ...studentAccountForm,
                  parentName: event.target.value,
                })
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Parent phone</span>
            <input
              className="field w-full"
              placeholder="Parent phone number"
              value={studentAccountForm.parentPhone}
              onChange={(event) =>
                onStudentAccountFormChange({
                  ...studentAccountForm,
                  parentPhone: event.target.value,
                })
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Student phone</span>
            <input
              className="field w-full"
              placeholder="Student phone number"
              value={studentAccountForm.studentPhone}
              onChange={(event) =>
                onStudentAccountFormChange({
                  ...studentAccountForm,
                  studentPhone: event.target.value,
                })
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Join date</span>
            <input
              className="field w-full"
              type="date"
              value={studentAccountForm.joinDate}
              onChange={(event) =>
                onStudentAccountFormChange({ ...studentAccountForm, joinDate: event.target.value })
              }
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Monthly fee</span>
            <input
              className="field w-full"
              type="number"
              min="0"
              value={studentAccountForm.monthlyFee}
              onChange={(event) =>
                onStudentAccountFormChange({
                  ...studentAccountForm,
                  monthlyFee: event.target.value,
                })
              }
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Pending fees</span>
            <input
              className="field w-full"
              type="number"
              min="0"
              value={studentAccountForm.pendingFees}
              onChange={(event) =>
                onStudentAccountFormChange({
                  ...studentAccountForm,
                  pendingFees: event.target.value,
                })
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Fee status</span>
            <select
              className="field w-full"
              value={studentAccountForm.feeStatus}
              onChange={(event) =>
                onStudentAccountFormChange({
                  ...studentAccountForm,
                  feeStatus: event.target.value,
                })
              }
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end xl:col-span-2">
            <button
              type="submit"
              className="gold-button min-h-11 w-full flex-1"
              disabled={isCreatingStudentAccount}
            >
              <UserPlus size={16} />
              {isCreatingStudentAccount ? "Creating..." : "Create Student Account"}
            </button>
          </div>
        </div>

        {(studentAccountError || studentAccountNotice) && (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              studentAccountError
                ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
            }`}
          >
            {studentAccountError || studentAccountNotice}
          </p>
        )}
      </form>

      <form className="surface space-y-5 p-4" onSubmit={onSubmit}>
        <div>
          <p className="section-title">{editingUserId ? "Edit user" : "Add user"}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {editingUserId ? userForm.name : "New user profile"}
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Firebase UID</span>
            <input
              className="field w-full disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Auth user UID"
              value={userForm.uid}
              onChange={(event) => onFormChange({ ...userForm, uid: event.target.value })}
              disabled={Boolean(editingUserId)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Name</span>
            <input
              className="field w-full"
              placeholder="Full name"
              value={userForm.name}
              onChange={(event) => onFormChange({ ...userForm, name: event.target.value })}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Email</span>
            <input
              className="field w-full"
              type="email"
              placeholder="user@academy.com"
              value={userForm.email}
              onChange={(event) => onFormChange({ ...userForm, email: event.target.value })}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Role</span>
            <select
              className="field w-full"
              value={userForm.role}
              onChange={(event) => onFormChange({ ...userForm, role: event.target.value })}
            >
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.COACH}>Coach</option>
              <option value={ROLES.STUDENT}>Student</option>
            </select>
          </label>

          {showStudentLink && (
            <label className="block md:col-span-2 xl:col-span-1">
              <span className="mb-2 block text-sm text-neutral-400">Linked Student ID</span>
              <input
                className="field w-full"
                placeholder="ST-104"
                value={userForm.studentId || ""}
                onChange={(event) =>
                  onFormChange({ ...userForm, studentId: event.target.value })
                }
              />
            </label>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end xl:col-span-2">
            <button type="submit" className="gold-button min-h-11 w-full flex-1" disabled={isSavingUser}>
              <UserPlus size={16} />
              {isSavingUser ? "Saving..." : editingUserId ? "Update user" : "Add user"}
            </button>
            {editingUserId && (
              <button type="button" className="ghost-button min-h-11 w-full sm:w-auto" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {(userError || userNotice) && (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              userError
                ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
            }`}
          >
            {userError || userNotice}
          </p>
        )}
      </form>

      <section className="space-y-4">
        <div>
          <p className="section-title">Directory</p>
          <h3 className="mt-2 text-lg font-semibold text-white">User profiles</h3>
        </div>

        {isLoadingUsers ? (
          <div className="surface p-4 text-sm text-neutral-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="surface p-4 text-sm text-neutral-400">No user profiles found.</div>
        ) : (
          <>
            <div className="surface hidden overflow-hidden lg:block">
              <div className="grid grid-cols-[1.1fr_1.1fr_0.7fr_0.9fr_1fr] gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Created</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-white/5">
                {users.map((user) => (
                  <div
                    key={user.uid}
                    className="grid grid-cols-[1.1fr_1.1fr_0.7fr_0.9fr_1fr] items-center gap-4 px-4 py-4 text-sm"
                  >
                    <span>
                      <span className="block font-medium text-white">{user.name}</span>
                      <span className="mt-1 block text-xs text-neutral-500">{user.uid}</span>
                    </span>
                    <span className="break-words text-neutral-300">{user.email}</span>
                    <RoleBadge role={user.role} />
                    <span className="text-neutral-300">{formatProfileCreatedAt(user.createdAt)}</span>
                    <span className="grid gap-2 sm:grid-cols-2">
                      <button type="button" className="ghost-button min-h-10" onClick={() => onEdit(user)}>
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-button min-h-10 text-rose-200 hover:border-rose-400/60 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={user.uid === currentUserId}
                        onClick={() => onDelete(user.uid)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {users.map((user) => (
                <article key={user.uid} className="surface p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        {user.uid}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{user.name}</h3>
                      <p className="mt-1 break-words text-sm text-neutral-400">{user.email}</p>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-neutral-500">Created</dt>
                      <dd className="mt-1 text-white">{formatProfileCreatedAt(user.createdAt)}</dd>
                    </div>
                    {user.role === ROLES.STUDENT && (
                      <div>
                        <dt className="text-neutral-500">Student ID</dt>
                        <dd className="mt-1 text-white">{user.studentId || user.uid}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button type="button" className="ghost-button flex-1" onClick={() => onEdit(user)}>
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost-button flex-1 text-rose-200 hover:border-rose-400/60 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user.uid === currentUserId}
                      onClick={() => onDelete(user.uid)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StudentsView({
  students,
  batches,
  canManageStudents,
  studentForm,
  editingStudentId,
  isLoadingStudents,
  isSavingStudent,
  studentError,
  studentNotice,
  onFormChange,
  onSubmit,
  onCancel,
  onAttendanceChange,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Students</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Student list</h2>
        </div>
        <p className="text-sm text-neutral-400">{students.length} enrolled</p>
      </section>

      {canManageStudents && (
        <form className="surface space-y-5 p-4" onSubmit={onSubmit}>
          <div>
            <p className="section-title">{editingStudentId ? "Edit student" : "Add student"}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {editingStudentId ? studentForm.name : "New student"}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Student ID</span>
              <input
                className="field w-full disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="ST-107"
                value={studentForm.id}
                onChange={(event) => onFormChange({ ...studentForm, id: event.target.value })}
                disabled={Boolean(editingStudentId)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Name</span>
              <input
                className="field w-full"
                placeholder="Student name"
                value={studentForm.name}
                onChange={(event) => onFormChange({ ...studentForm, name: event.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Parent name</span>
              <input
                className="field w-full"
                placeholder="Parent or guardian"
                value={studentForm.parentName}
                onChange={(event) =>
                  onFormChange({ ...studentForm, parentName: event.target.value })
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Parent phone number</span>
              <input
                className="field w-full"
                type="tel"
                inputMode="tel"
                placeholder="9876543210"
                value={studentForm.parentPhoneNumber}
                onChange={(event) =>
                  onFormChange({ ...studentForm, parentPhoneNumber: event.target.value })
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Student phone number</span>
              <input
                className="field w-full"
                type="tel"
                inputMode="tel"
                placeholder="9876543211"
                value={studentForm.studentPhoneNumber}
                onChange={(event) =>
                  onFormChange({ ...studentForm, studentPhoneNumber: event.target.value })
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Batch</span>
              <select
                className="field w-full"
                value={studentForm.batchId}
                onChange={(event) => onFormChange({ ...studentForm, batchId: event.target.value })}
              >
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Monthly fee</span>
              <input
                className="field w-full"
                type="number"
                min="0"
                placeholder="2800"
                value={studentForm.feeAmount}
                onChange={(event) =>
                  onFormChange({ ...studentForm, feeAmount: event.target.value })
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Join date</span>
              <input
                className="field w-full"
                type="date"
                value={studentForm.joinDate}
                onChange={(event) =>
                  onFormChange({ ...studentForm, joinDate: event.target.value })
                }
                required
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end xl:col-span-2">
              <button
                type="submit"
                className="gold-button min-h-11 w-full flex-1"
                disabled={isSavingStudent}
              >
                <UserPlus size={16} />
                {isSavingStudent
                  ? "Saving..."
                  : editingStudentId
                    ? "Update student"
                    : "Add student"}
              </button>
              {editingStudentId && (
                <button
                  type="button"
                  className="ghost-button min-h-11 w-full sm:w-auto"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {(studentError || studentNotice) && (
            <p
              className={`rounded-lg border px-3 py-2 text-sm ${
                studentError
                  ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                  : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
              }`}
            >
              {studentError || studentNotice}
            </p>
          )}
        </form>
      )}

      <section className="space-y-4">
        <div>
          <p className="section-title">Roster</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Student records</h3>
        </div>

        {isLoadingStudents ? (
          <div className="surface p-4 text-sm text-neutral-400">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="surface p-4 text-sm text-neutral-400">
            No students have been added yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                batch={getBatchById(batches, student.batchId)}
                canManageAttendance={false}
                canManageStudents={canManageStudents}
                onAttendanceChange={onAttendanceChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProgressBar({ value, label, helper }) {
  const width = `${Math.min(Math.max(value, 0), 100)}%`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-white">{label}</span>
        <span className="text-academy-gold">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-academy-gold" style={{ width }} />
      </div>
      {helper && <p className="mt-1 text-xs text-neutral-500">{helper}</p>}
    </div>
  );
}

function SplitAttendanceChart({ absent, present }) {
  const total = present + absent;
  const presentWidth = `${getPercentage(present, total)}%`;
  const absentWidth = `${getPercentage(absent, total)}%`;

  return (
    <div className="space-y-3">
      <div className="flex h-4 overflow-hidden rounded-full bg-white/10">
        <div className="bg-emerald-400" style={{ width: presentWidth }} />
        <div className="bg-rose-400" style={{ width: absentWidth }} />
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-100">
          <span>Present</span>
          <strong>{present}</strong>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-rose-100">
          <span>Absent</span>
          <strong>{absent}</strong>
        </div>
      </div>
    </div>
  );
}

function BarChart({ rows, valueKey, labelKey, formatter = (value) => value }) {
  const maxValue = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 1);

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const value = Number(row[valueKey]) || 0;
        const width = `${Math.max((value / maxValue) * 100, value > 0 ? 5 : 0)}%`;

        return (
          <div key={row[labelKey]}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-neutral-300">{row[labelKey]}</span>
              <span className="font-medium text-white">{formatter(value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-academy-gold" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsView({ attendanceRecords, batches, feeRecords, role, students }) {
  const [reportMonth, setReportMonth] = useState(getLocalMonthKey);
  const [reportNotice, setReportNotice] = useState("");
  const isAdmin = role === ROLES.ADMIN;
  const monthDate = new Date(`${reportMonth}-01T00:00:00`);
  const analytics = getMonthlyAnalytics(students, attendanceRecords, feeRecords, reportMonth);
  const studentAttendanceRows = getStudentAttendanceRows(students, attendanceRecords, reportMonth);
  const batchAttendanceRows = getBatchAttendanceRows(batches, students, attendanceRecords, reportMonth);
  const revenueTrendRows = getRevenueTrendRows(students, feeRecords, getMonthRange(6, monthDate));
  const paidFeeRows = analytics.feeRows.filter((row) => row.status === "paid");
  const pendingFeeRows = analytics.feeRows.filter((row) => row.dueAmount > 0);

  const exportSections = [
    {
      title: "Attendance Summary",
      headers: ["Metric", "Value"],
      rows: [
        ["Month", formatMonth(reportMonth)],
        ["Attendance percentage", `${analytics.attendancePercentage}%`],
        ["Present records", analytics.present],
        ["Absent records", analytics.absent],
        ["Marked records", analytics.markedAttendance],
      ],
    },
    {
      title: "Student Attendance",
      headers: ["Student ID", "Student", "Present", "Absent", "Marked", "Percentage"],
      rows: studentAttendanceRows.map((row) => [
        row.student.id,
        row.student.name,
        row.present,
        row.absent,
        row.marked,
        `${row.percentage}%`,
      ]),
    },
    {
      title: "Batch Attendance",
      headers: ["Batch", "Coach", "Students", "Present", "Absent", "Percentage"],
      rows: batchAttendanceRows.map((row) => [
        row.name,
        row.coach,
        row.totalStudents,
        row.present,
        row.absent,
        `${row.percentage}%`,
      ]),
    },
    {
      title: isAdmin ? "Fee Summary" : "Fee Status",
      headers: ["Student ID", "Student", "Amount", "Paid", "Due", "Status"],
      rows: analytics.feeRows.map((row) => [
        row.studentId,
        row.studentName,
        row.amount,
        isAdmin ? row.amountPaid : row.status === "paid" ? "Paid" : "Pending",
        isAdmin ? row.dueAmount : row.dueAmount > 0 ? "Due" : "Clear",
        row.status,
      ]),
    },
  ];

  function exportReportsCsv() {
    const rows = exportSections.flatMap((section) => [
      [section.title],
      section.headers,
      ...section.rows,
      [],
    ]);
    downloadCsv(`academy-reports-${reportMonth}.csv`, rows);
    setReportNotice("CSV report exported.");
  }

  function exportReportsPdf() {
    const didOpen = openPrintableReport(`Archery Academy Reports - ${formatMonth(reportMonth)}`, exportSections);
    setReportNotice(
      didOpen
        ? "PDF export opened. Choose Save as PDF in the print dialog."
        : "Your browser blocked the PDF export window.",
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-title">Reports</p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {isAdmin ? "Reports and analytics" : "Coach reports"}
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Real-time insights from attendance, fee, and student records for {formatMonth(reportMonth)}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_auto_auto] sm:items-end">
          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Report month</span>
            <input
              className="field w-full"
              type="month"
              value={reportMonth}
              onChange={(event) => setReportMonth(event.target.value)}
            />
          </label>
          <button type="button" className="ghost-button min-h-11" onClick={exportReportsCsv}>
            <Download size={16} />
            Excel/CSV
          </button>
          <button type="button" className="gold-button min-h-11" onClick={exportReportsPdf}>
            <Download size={16} />
            PDF
          </button>
        </div>
      </section>

      {reportNotice && (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
          {reportNotice}
        </p>
      )}

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardCard
            icon={Users}
            label="Active students"
            value={analytics.activeStudents}
            helper="Current roster"
          />
          <DashboardCard
            icon={CalendarDays}
            label="Attendance"
            value={`${analytics.attendancePercentage}%`}
            helper={`${analytics.present}/${analytics.markedAttendance || 0} present records`}
          />
          {isAdmin && (
            <DashboardCard
              icon={TrendingUp}
              label="Monthly revenue"
              value={formatCurrency(analytics.feeSummary.monthlyIncome)}
              helper={`${analytics.feeSummary.paidCount} paid students`}
            />
          )}
          <DashboardCard
            icon={ClipboardCheck}
            label={isAdmin ? "Pending dues" : "Pending students"}
            value={
              isAdmin
                ? formatCurrency(analytics.feeSummary.pendingTotal)
                : analytics.feeSummary.pendingCount
            }
            helper={`${analytics.feeSummary.pendingCount} records pending`}
          />
          <DashboardCard
            icon={UserPlus}
            label="New admissions"
            value={analytics.newAdmissions}
            helper={formatMonth(reportMonth)}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-title">Attendance reports</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Present/Absent chart</h3>
            </div>
            <span className="rounded-lg border border-white/10 px-3 py-1 text-sm text-neutral-300">
              {analytics.markedAttendance} marked
            </span>
          </div>
          <div className="mt-5">
            <SplitAttendanceChart present={analytics.present} absent={analytics.absent} />
          </div>
        </article>

        <article className="surface p-4">
          <p className="section-title">Batch-wise analytics</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Batch attendance percentage</h3>
          <div className="mt-5 space-y-4">
            {batchAttendanceRows.map((row) => (
              <ProgressBar
                key={row.id}
                value={row.percentage}
                label={row.name}
                helper={`${row.present} present, ${row.absent} absent | ${row.totalStudents} students`}
              />
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-title">Student-wise attendance</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Monthly percentage</h3>
          </div>
          <p className="text-sm text-neutral-400">{studentAttendanceRows.length} students</p>
        </div>

        <div className="surface hidden overflow-hidden md:block">
          <div className="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr_1fr] gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
            <span>Student</span>
            <span>Present</span>
            <span>Absent</span>
            <span>Marked</span>
            <span>Percentage</span>
          </div>
          <div className="divide-y divide-white/5">
            {studentAttendanceRows.map((row) => (
              <div
                key={row.student.id}
                className="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr_1fr] items-center gap-4 px-4 py-4 text-sm"
              >
                <span>
                  <span className="block font-medium text-white">{row.student.name}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{row.student.id}</span>
                </span>
                <span className="text-white">{row.present}</span>
                <span className="text-white">{row.absent}</span>
                <span className="text-white">{row.marked}</span>
                <ProgressBar value={row.percentage} label="Attendance" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:hidden">
          {studentAttendanceRows.map((row) => (
            <article key={row.student.id} className="surface p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{row.student.id}</p>
              <h4 className="mt-2 font-semibold text-white">{row.student.name}</h4>
              <div className="mt-4">
                <ProgressBar
                  value={row.percentage}
                  label={`${row.percentage}% attendance`}
                  helper={`${row.present} present, ${row.absent} absent`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface p-4">
          <p className="section-title">Fee reports</p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {isAdmin ? "Monthly income summary" : "Monthly fee status"}
          </h3>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {isAdmin && (
              <>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <dt className="text-neutral-500">Collected</dt>
                  <dd className="mt-1 text-lg font-semibold text-white">
                    {formatCurrency(analytics.feeSummary.monthlyIncome)}
                  </dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <dt className="text-neutral-500">Expected</dt>
                  <dd className="mt-1 text-lg font-semibold text-white">
                    {formatCurrency(analytics.feeSummary.expectedTotal)}
                  </dd>
                </div>
              </>
            )}
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <dt className="text-neutral-500">Paid students</dt>
              <dd className="mt-1 text-lg font-semibold text-white">
                {analytics.feeSummary.paidCount}
              </dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <dt className="text-neutral-500">Pending fees</dt>
              <dd className="mt-1 text-lg font-semibold text-white">
                {isAdmin ? formatCurrency(analytics.feeSummary.pendingTotal) : pendingFeeRows.length}
              </dd>
            </div>
          </dl>
        </article>

        {isAdmin ? (
          <article className="surface p-4">
            <p className="section-title">Income analytics</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Six-month collection trend</h3>
            <div className="mt-5">
              <BarChart
                rows={revenueTrendRows.map((row) => ({
                  ...row,
                  label: formatMonth(row.month),
                }))}
                labelKey="label"
                valueKey="income"
                formatter={formatCurrency}
              />
            </div>
          </article>
        ) : (
          <article className="surface p-4">
            <p className="section-title">Coach access</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Limited report mode</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Coach reports include attendance analytics and fee status lists. Admin-only revenue
              trend and full financial totals stay hidden.
            </p>
          </article>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface overflow-hidden">
          <div className="border-b border-white/10 p-4">
            <p className="section-title">Pending fee report</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{pendingFeeRows.length} pending</h3>
          </div>
          <div className="divide-y divide-white/5">
            {pendingFeeRows.length === 0 ? (
              <p className="p-4 text-sm text-neutral-400">No pending dues for this month.</p>
            ) : (
              pendingFeeRows.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div>
                    <p className="font-medium text-white">{row.studentName}</p>
                    <p className="mt-1 text-neutral-500">{row.studentId}</p>
                  </div>
                  <div className="text-right">
                    <FeeStatusBadge status={row.status} />
                    {isAdmin && (
                      <p className="mt-2 text-neutral-300">{formatCurrency(row.dueAmount)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface overflow-hidden">
          <div className="border-b border-white/10 p-4">
            <p className="section-title">Paid students list</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{paidFeeRows.length} paid</h3>
          </div>
          <div className="divide-y divide-white/5">
            {paidFeeRows.length === 0 ? (
              <p className="p-4 text-sm text-neutral-400">No paid records for this month.</p>
            ) : (
              paidFeeRows.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div>
                    <p className="font-medium text-white">{row.studentName}</p>
                    <p className="mt-1 text-neutral-500">{row.paymentDate || "Payment date not added"}</p>
                  </div>
                  <div className="text-right">
                    <FeeStatusBadge status={row.status} />
                    {isAdmin && (
                      <p className="mt-2 text-neutral-300">{formatCurrency(row.amountPaid)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <section>
        <p className="section-title">Settings</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Admin settings</h2>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="surface p-4">
          <h3 className="text-lg font-semibold text-white">Fee cycle</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Monthly fee register is prepared for future Firebase-backed billing rules and due-date
            automation.
          </p>
        </article>
        <article className="surface p-4">
          <h3 className="text-lg font-semibold text-white">Role access</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Admin-only configuration lives here so coach and student accounts stay on operational
            views only.
          </p>
        </article>
      </div>
    </div>
  );
}

export default App;
