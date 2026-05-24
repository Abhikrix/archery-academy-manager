import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import { Navigate } from "react-router-dom";
import heroImage from "../assets/login-hero.jpg";
import { useAuth } from "../context/AuthContext";
import { getRoleHomePath } from "../utils/roleRoutes";
import ThemeToggle from "./ThemeToggle";

export default function LoginView() {
  const { authError, isFirebaseConfigured, loading, login, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (profile) {
    return <Navigate to={getRoleHomePath(profile.role)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-view relative min-h-screen overflow-hidden bg-black">
      <img
        src={heroImage}
        alt=""
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="login-overlay absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.88)_38%,rgba(0,0,0,0.52)_68%,rgba(0,0,0,0.78)_100%)]" />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle compact />
      </div>

      <div className="relative flex min-h-screen items-center px-4 py-6 sm:px-6 lg:px-10">
        <section className="w-full max-w-md">
          <p className="section-title">ARCOS ARCHERY ACADEMY</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Sign in
          </h1>
          <p className="mt-3 text-sm text-neutral-300">
            Use your academy account to continue.
          </p>

          <form className="surface mt-8 space-y-4 p-4 sm:p-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Email</span>
              <span className="relative block">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  className="field w-full pl-10"
                  type="email"
                  autoComplete="email"
                  placeholder="you@academy.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Password</span>
              <span className="relative block">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  className="field w-full pl-10 pr-11"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-all duration-200 hover:bg-white/[0.04] hover:text-[rgb(var(--academy-gold))] focus:bg-white/[0.08] focus:text-[rgb(var(--academy-gold))] focus:outline-none active:scale-95"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {!isFirebaseConfigured && (
              <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
                Firebase env values are not configured yet.
              </p>
            )}

            {(formError || authError) && (
              <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                {formError || authError}
              </p>
            )}

            <button
              type="submit"
              className="gold-button w-full"
              disabled={!isFirebaseConfigured || loading || submitting}
            >
              <LogIn size={16} />
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
