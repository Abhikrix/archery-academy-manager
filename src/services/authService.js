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
import { auth, db, isFirebaseConfigured } from "../config/firebase";
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
    role: ROLES.ADMIN,
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

  return {
    uid: data.uid || snapshot.id,
    name: data.name || data.email || "Academy user",
    email: data.email || "",
    role: allowedRoles.has(data.role) ? data.role : ROLES.STUDENT,
    studentId: data.studentId || "",
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
