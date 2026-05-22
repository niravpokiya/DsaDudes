import { Eye, EyeOff, LoaderCircle, Lock, Mail, User, UserPlus } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import { login, register } from "../utils/auth-apis";
import AuthShell from "./AuthShell";
import { validateRegisterForm } from "./authValidation";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    const from = location.state?.from;
    return from?.pathname ? `${from.pathname}${from.search || ""}${from.hash || ""}` : "/";
  }, [location.state]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const authResponse = await login({
        username: form.username.trim(),
        password: form.password,
      });

      if (authResponse.user) {
        localStorage.setItem("user", JSON.stringify(authResponse.user));
        setUser(authResponse.user);
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(error.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join DSADude and start solving."
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
      switchState={location.state}
      highlights={[
        { title: "Instant access", description: "Registration finishes with an automatic login." },
        { title: "Validation", description: "Email, password strength, and confirmation are checked." },
        { title: "Accessible UX", description: "Labels, focus rings, and clear feedback are built in." },
      ]}
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-200">Create account</p>
          <h2 className="text-2xl font-semibold text-white">Start your profile</h2>
          <p className="text-sm leading-6 text-slate-400">Pick a username, email, and password.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {submitError ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              {submitError}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="register-username" className="block text-sm font-medium text-slate-200">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="register-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange("username")}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? "register-username-error" : undefined}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-purple-400/70 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/15"
                placeholder="your-username"
              />
            </div>
            <p id="register-username-error" className={`min-h-5 text-sm text-red-300 ${errors.username ? "opacity-100" : "opacity-0"}`} aria-live="polite">
              {errors.username || "Username error"}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="block text-sm font-medium text-slate-200">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "register-email-error" : undefined}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-purple-400/70 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/15"
                placeholder="you@example.com"
              />
            </div>
            <p id="register-email-error" className={`min-h-5 text-sm text-red-300 ${errors.email ? "opacity-100" : "opacity-0"}`} aria-live="polite">
              {errors.email || "Email error"}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange("password")}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "register-password-error" : "register-password-hint"}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-purple-400/70 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/15"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div id="register-password-hint" className="min-h-5 text-xs text-slate-500" aria-hidden="true">
              Use a strong password.
            </div>
            <p id="register-password-error" className={`min-h-5 text-sm text-red-300 ${errors.password ? "opacity-100" : "opacity-0"}`} aria-live="polite">
              {errors.password || "Password error"}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-confirm" className="block text-sm font-medium text-slate-200">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="register-confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "register-confirm-error" : undefined}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-purple-400/70 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/15"
                placeholder="Repeat your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p id="register-confirm-error" className={`min-h-5 text-sm text-red-300 ${errors.confirmPassword ? "opacity-100" : "opacity-0"}`} aria-live="polite">
              {errors.confirmPassword || "Confirm password error"}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.25)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-400/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;