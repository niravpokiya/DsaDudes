import { Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import { login } from "../utils/auth-apis";
import AuthShell from "./AuthShell";
import { validateLoginForm } from "./authValidation";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await login({
        username: form.username.trim(),
        password: form.password,
      });

      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(error.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your coding workspace, submissions, and protected problem sets."
    >
      <form className="block w-full space-y-5" onSubmit={handleSubmit} noValidate>
        
        {/* Error Handling Box using your theme specs */}
        {submitError ? (
          <div className="block rounded-lg border border-[var(--error)] bg-[var(--error-bg)] px-4 py-3 text-xs text-[var(--error)]" role="alert">
            {submitError}
          </div>
        ) : null}

        {/* --- Username Field --- */}
        <div className="block w-full space-y-2">
          <label htmlFor="login-username" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Username or email
          </label>
          <div className="relative block w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange("username")}
              aria-invalid={Boolean(errors.username)}
              style={{ background: "var(--glass)", borderColor: "var(--border-glass)" }}
              className="h-12 w-full block rounded-lg border pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
              placeholder="Enter your username or email"
            />
          </div>
          {errors.username ? (
            <p className="text-xs text-[var(--error)] mt-1">{errors.username}</p>
          ) : null}
        </div>

        {/* --- Password Field --- */}
        <div className="block w-full space-y-2">
          <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Password
          </label>
          <div className="relative block w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange("password")}
              aria-invalid={Boolean(errors.password)}
              style={{ background: "var(--glass)", borderColor: "var(--border-glass)" }}
              className="h-12 w-full block rounded-lg border pl-11 pr-12 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
              placeholder="Enter your password"
            />
            {/* Embedded Action Button inside the context block */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--glass-hover)] hover:text-[var(--text-secondary)] transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {errors.password ? (
            <p className="text-xs text-[var(--error)] mt-1">{errors.password}</p>
          ) : null}
        </div>

        {/* --- Action Primary Trigger Button --- */}
        <div className="block w-full pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary h-12 w-full text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </div>

        {/* --- Footer Links Block --- */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--border-primary)] text-xs">
          <Link
            to="/register"
            state={location.state}
            className="font-semibold text-[var(--text-accent)] hover:text-[var(--accent-light)] transition-colors underline underline-offset-4"
          >
            Create account
          </Link>
          <Link
            to="/"
            className="btn btn-secondary !px-3 !py-1.5 text-xs font-medium rounded-md"
          >
            Back to home
          </Link>
        </div>

      </form>
    </AuthShell>
  );
};

export default Login;