import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getUserProfile,
  loginWithEmail,
  logout,
  subscribeToAuthChanges,
} from "../services/authService";
import { isFirebaseConfigured } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);
      setAuthError("");

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const nextProfile = await getUserProfile(user);
        setProfile({
          ...nextProfile,
          email: user.email,
          name: nextProfile.name || user.displayName || user.email || "Academy user",
        });
      } catch (error) {
        setProfile(null);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      authError,
      firebaseUser,
      isFirebaseConfigured,
      loading,
      login: loginWithEmail,
      logout,
      profile,
    }),
    [authError, firebaseUser, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
