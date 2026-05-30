import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import { login, register } from "../utils/auth-apis";
import AuthPageShell from "./AuthPageShell";
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
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const hasFormError = Boolean(submitError);

  const redirectPath = useMemo(() => {
    const from = location.state?.from;
    return from?.pathname ? `${from.pathname}${from.search || ""}${from.hash || ""}` : "/profile";
  }, [location.state]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

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
      if (error?.fieldErrors) {
        setErrors((previous) => ({ ...previous, ...error.fieldErrors }));
      }

      const message = String(error?.message || "Registration failed.").toLowerCase();

      if (message.includes("email already exists")) {
        setErrors((previous) => ({ ...previous, email: "Email already exists." }));
      }

      if (message.includes("username already exists")) {
        setErrors((previous) => ({ ...previous, username: "Username already exists." }));
      }

      setSubmitError(error?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      title="Sign up"
      subtitle="Create a new account."
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {submitError ? (
          <div style={submitBannerStyle} role="alert">
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Registration failed</div>
            {submitError}
          </div>
        ) : null}

        <div>
          <label htmlFor="register-username" style={labelStyle}>Username</label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange("username")}
            aria-invalid={Boolean(errors.username)}
            placeholder="your-username"
            style={getInputStyle(Boolean(errors.username))}
          />
          {errors.username ? <p style={errorStyle}>{errors.username}</p> : null}
        </div>

        <div>
          <label htmlFor="register-email" style={labelStyle}>Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(errors.email)}
            placeholder="you@example.com"
            style={getInputStyle(Boolean(errors.email))}
          />
          {errors.email ? <p style={errorStyle}>{errors.email}</p> : null}
        </div>

        <div>
          <label htmlFor="register-password" style={labelStyle}>Password</label>
          <div style={passwordFieldStyle}>
            <input
              id="register-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange("password")}
              aria-invalid={Boolean(errors.password)}
              placeholder="Create password"
              style={getPasswordInputStyle(Boolean(errors.password))}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((previous) => !previous)}
              aria-label={showPasswords ? "Hide password" : "Show password"}
              aria-pressed={showPasswords}
              style={toggleButtonStyle}
            >
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? <p style={errorStyle}>{errors.password}</p> : null}
        </div>

        <div>
          <label htmlFor="register-confirm" style={labelStyle}>Confirm password</label>
          <div style={passwordFieldStyle}>
            <input
              id="register-confirm"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              aria-invalid={Boolean(errors.confirmPassword)}
              placeholder="Repeat password"
              style={getPasswordInputStyle(Boolean(errors.confirmPassword))}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((previous) => !previous)}
              aria-label={showPasswords ? "Hide password" : "Show password"}
              aria-pressed={showPasswords}
              style={toggleButtonStyle}
            >
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword ? <p style={errorStyle}>{errors.confirmPassword}</p> : null}
        </div>

        <button type="submit" disabled={isSubmitting} style={buttonStyle}>
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>{isSubmitting ? "Creating account..." : "Create account"}</span>
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "13px" }}>
          <Link to="/login" state={location.state}>
            Sign in
          </Link>
          <Link to="/">
            Back to home
          </Link>
        </div>
      </form>
    </AuthPageShell>
  );
};

const inputStyle = {
  width: "100%",
  height: "44px",
  borderRadius: "10px",
  border: "1px solid var(--border-primary)",
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  padding: "0 14px",
  outline: "none",
  boxSizing: "border-box",
};

const errorInputStyle = {
  border: "1px solid var(--error)",
  boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.12)",
};

const passwordFieldStyle = {
  position: "relative",
};

const passwordInputStyle = {
  ...inputStyle,
  paddingRight: "48px",
};

const passwordInputErrorStyle = {
  ...passwordInputStyle,
  ...errorInputStyle,
};

const toggleButtonStyle = {
  position: "absolute",
  top: "50%",
  right: "12px",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  cursor: "pointer",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  fontWeight: 600,
};

const buttonStyle = {
  height: "44px",
  borderRadius: "10px",
  border: "1px solid var(--text-accent)",
  background: "var(--text-accent)",
  color: "var(--bg-primary)",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

const errorStyle = {
  margin: "6px 0 0",
  color: "var(--error)",
  fontSize: "12px",
};

const submitBannerStyle = {
  border: "1px solid var(--error)",
  background: "var(--error-bg)",
  color: "var(--error)",
  borderRadius: "12px",
  padding: "12px 14px",
  fontSize: "13px",
  lineHeight: 1.5,
};

const getInputStyle = (hasError) => ({
  ...inputStyle,
  ...(hasError ? errorInputStyle : null),
});

const getPasswordInputStyle = (hasError) => ({
  ...(hasError ? passwordInputErrorStyle : passwordInputStyle),
});

export default Register;