import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, firebaseApiKey, isFirebaseConfigured } from "../config/firebase";
import { ROLES } from "../constants/roles";

const allowedRoles = new Set(Object.values(ROLES));

function requireFirebase() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error("Firebase is not configured. Add your VITE_FIREBASE_* values first.");
  }
}

export async function loginWithEmail(email, password) {
  requireFirebase();
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  requireFirebase();
  return signOut(auth);
}

export function subscribeToAuthChanges(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

async function createDefaultUserProfile(userRef, user) {
  const profile = {
    uid: user.uid,
    name: user.displayName || user.email || "Academy user",
    email: user.email || "",
    role: ROLES.STUDENT,
    studentId: user.uid,
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);

  return {
    ...profile,
    createdAt: new Date().toISOString(),
  };
}

function normalizeUserProfile(snapshot) {
  const data = snapshot.data();

  const role = allowedRoles.has(data.role) ? data.role : ROLES.STUDENT;

  return {
    uid: data.uid || snapshot.id,
    name: data.name || data.email || "Academy user",
    email: data.email || "",
    role,
    studentId: role === ROLES.STUDENT ? data.studentId || data.uid || snapshot.id : "",
    createdAt: data.createdAt || null,
  };
}

export async function getUserProfile(user) {
  requireFirebase();

  const userRef = doc(db, "users", user.uid);
  const profileSnapshot = await getDoc(userRef);

  if (!profileSnapshot.exists()) {
    return createDefaultUserProfile(userRef, user);
  }

  const profile = normalizeUserProfile(profileSnapshot);

  if (!allowedRoles.has(profile.role)) {
    throw new Error("This account has an invalid role.");
  }

  return {
    ...profile,
    uid: user.uid,
    email: profile.email || user.email || "",
    name: profile.name || user.displayName || user.email || "Academy user",
  };
}

export function subscribeToUserProfiles(onUsers, onError) {
  requireFirebase();

  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      onUsers(
        snapshot.docs
          .map(normalizeUserProfile)
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    },
    onError,
  );
}

export async function saveUserProfile(profile) {
  requireFirebase();

  const normalizedProfile = {
    uid: String(profile.uid || "").trim(),
    name: String(profile.name || "").trim(),
    email: String(profile.email || "").trim(),
    role: allowedRoles.has(profile.role) ? profile.role : ROLES.STUDENT,
    studentId: String(profile.studentId || "").trim(),
    createdAt: profile.createdAt || serverTimestamp(),
  };

  if (!normalizedProfile.uid) {
    throw new Error("User UID is required.");
  }

  if (!normalizedProfile.name) {
    throw new Error("User name is required.");
  }

  if (!normalizedProfile.email) {
    throw new Error("User email is required.");
  }

  const profilePayload = {
    uid: normalizedProfile.uid,
    name: normalizedProfile.name,
    email: normalizedProfile.email,
    role: normalizedProfile.role,
    createdAt: normalizedProfile.createdAt,
  };

  if (normalizedProfile.role === ROLES.STUDENT && normalizedProfile.studentId) {
    profilePayload.studentId = normalizedProfile.studentId;
  }

  await setDoc(doc(db, "users", normalizedProfile.uid), profilePayload);

  return normalizedProfile;
}

export async function deleteUserProfile(uid) {
  requireFirebase();
  await deleteDoc(doc(db, "users", uid));
}

function getIdentityToolkitErrorMessage(code) {
  const messages = {
    EMAIL_EXISTS: "A Firebase Auth user already exists with this email.",
    INVALID_EMAIL: "Enter a valid student email address.",
    MISSING_PASSWORD: "Student password is required.",
    WEAK_PASSWORD: "Use a stronger password with at least 6 characters.",
    OPERATION_NOT_ALLOWED: "Enable Email/Password sign-in in Firebase Authentication first.",
  };

  return messages[code] || code || "Firebase Authentication could not create this student.";
}

async function createStudentAuthUser(email, password) {
  if (!firebaseApiKey) {
    throw new Error("Firebase API key is missing. Check VITE_FIREBASE_API_KEY.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(getIdentityToolkitErrorMessage(payload?.error?.message));
  }

  return {
    idToken: payload.idToken,
    uid: payload.localId,
  };
}

async function rollbackStudentAuthUser(idToken) {
  if (!idToken || !firebaseApiKey) {
    return;
  }

  await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${firebaseApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export async function createStudentAccount(account) {
  requireFirebase();

  const normalizedAccount = {
    email: String(account.email || "").trim(),
    password: String(account.password || ""),
    studentId: String(account.studentId || "").trim(),
    name: String(account.name || "").trim(),
    batchId: String(account.batchId || account.batch || "").trim(),
    parentName: String(account.parentName || "").trim(),
    parentPhone: String(account.parentPhone || account.parentPhoneNumber || "").trim(),
    studentPhone: String(account.studentPhone || account.studentPhoneNumber || "").trim(),
    dateOfBirth: String(account.dateOfBirth || account.joinDate || "").trim(),
    monthlyFee: Number(account.monthlyFee ?? account.feeAmount ?? 0),
    pendingFees: Number(account.pendingFees ?? 0),
    feeStatus: account.feeStatus === "paid" ? "paid" : "pending",
  };

  if (!normalizedAccount.email) {
    throw new Error("Student email is required.");
  }

  if (!normalizedAccount.password || normalizedAccount.password.length < 6) {
    throw new Error("Student password must be at least 6 characters.");
  }

  if (!normalizedAccount.name) {
    throw new Error("Student name is required.");
  }

  if (!normalizedAccount.studentId) {
    throw new Error("Student ID is required.");
  }

  if (!normalizedAccount.batchId) {
    throw new Error("Batch is required.");
  }

  if (!normalizedAccount.dateOfBirth) {
    throw new Error("Date of birth is required.");
  }

  const createdAuthUser = await createStudentAuthUser(
    normalizedAccount.email,
    normalizedAccount.password,
  );
  const uid = createdAuthUser.uid;

  try {
    const userPayload = {
      uid,
      name: normalizedAccount.name,
      email: normalizedAccount.email,
      role: ROLES.STUDENT,
      studentId: normalizedAccount.studentId,
      createdAt: serverTimestamp(),
    };
    const studentPayload = {
      id: uid,
      studentId: normalizedAccount.studentId,
      name: normalizedAccount.name,
      batch: normalizedAccount.batchId,
      batchId: normalizedAccount.batchId,
      feeStatus: normalizedAccount.feeStatus,
      monthlyFee: normalizedAccount.monthlyFee,
      feeAmount: normalizedAccount.monthlyFee,
      pendingFees: normalizedAccount.pendingFees,
      parentName: normalizedAccount.parentName,
      parentPhone: normalizedAccount.parentPhone,
      parentPhoneNumber: normalizedAccount.parentPhone,
      studentPhone: normalizedAccount.studentPhone,
      studentPhoneNumber: normalizedAccount.studentPhone,
      dateOfBirth: normalizedAccount.dateOfBirth,
      joinDate: normalizedAccount.dateOfBirth,
      attendanceStatus: "present",
      attendanceRate: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await Promise.all([
      setDoc(doc(db, "users", uid), userPayload),
      setDoc(doc(db, "students", uid), studentPayload),
    ]);

    return {
      uid,
      email: normalizedAccount.email,
      name: normalizedAccount.name,
    };
  } catch (error) {
    try {
      await Promise.all([
        deleteDoc(doc(db, "users", uid)),
        deleteDoc(doc(db, "students", uid)),
      ]);
    } catch {
      // Rollback cleanup is best-effort; surface the original setup failure.
    }

    try {
      await rollbackStudentAuthUser(createdAuthUser.idToken);
    } catch {
      // The original Firestore failure is more useful to the admin.
    }

    throw new Error(`Student Auth user was created, but Firestore setup failed: ${error.message}`);
  }
}
