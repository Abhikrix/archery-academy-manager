import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const x = (clientX - window.innerWidth / 2) / 35;
    const y = (clientY - window.innerHeight / 2) / 35;
    setMousePos({ x, y });
  };

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
    <div
      className="login-view relative min-h-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      <motion.img
        src={heroImage}
        alt=""
        decoding="async"
        fetchPriority="high"
        initial={{ scale: 1.08, filter: "brightness(0.85)" }}
        animate={{
          scale: 1.05,
          filter: "brightness(1)",
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{
          scale: { duration: 10, ease: [0.16, 1, 0.3, 1] },
          filter: { duration: 6, ease: "easeOut" },
          x: { type: "tween", ease: "easeOut", duration: 0.6 },
          y: { type: "tween", ease: "easeOut", duration: 0.6 },
        }}
        className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
      />
      <div className="login-overlay absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.88)_38%,rgba(0,0,0,0.52)_68%,rgba(0,0,0,0.78)_100%)]" />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle compact />
      </div>

      <div className="relative flex min-h-screen items-center px-4 py-6 sm:px-6 lg:px-10">
        <section className="w-full max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="section-title"
          >
            ARCOS ARCHERY ACADEMY
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Sign in
            </h1>
            <p className="mt-3 text-sm text-neutral-300">
              Use your academy account to continue.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <form className="surface mt-8 space-y-4 p-4 sm:p-5 animate-float" onSubmit={handleSubmit}>
            <motion.label
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="block"
            >
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
            </motion.label>

            <motion.label
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="block"
            >
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-all duration-250 hover:bg-white/[0.04] hover:text-[rgb(var(--academy-gold))] focus:bg-white/[0.08] focus:text-[rgb(var(--academy-gold))] focus:outline-none active:scale-90 hover:scale-105"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <span
                      className={`absolute transition-all duration-300 transform ${
                        showPassword
                          ? "pointer-events-none rotate-45 scale-75 opacity-0"
                          : "rotate-0 scale-100 opacity-100"
                      }`}
                    >
                      <Eye size={18} />
                    </span>
                    <span
                      className={`absolute transition-all duration-300 transform ${
                        showPassword
                          ? "rotate-0 scale-100 opacity-100"
                          : "pointer-events-none -rotate-45 scale-75 opacity-0"
                      }`}
                    >
                      <EyeOff size={18} />
                    </span>
                  </span>
                </button>
              </span>
            </motion.label>

            {!isFirebaseConfigured && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100"
              >
                Firebase env values are not configured yet.
              </motion.p>
            )}

            {(formError || authError) && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
              >
                {formError || authError}
              </motion.p>
            )}

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              type="submit"
              className="gold-button w-full"
              disabled={!isFirebaseConfigured || loading || submitting}
            >
              <LogIn size={16} />
              {submitting ? "Signing in..." : "Sign in"}
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  </div>
  );
}
