import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import { login } from "../utils/auth-apis";
import AuthPageShell from "./AuthPageShell";
import { validateLoginForm } from "./authValidation";
import getUser from "../Helpers/getUser";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasFieldError = Boolean(errors.username || errors.password);

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

      const validationErrors =
        validateLoginForm(form);

      if (
        Object.keys(validationErrors)
          .length > 0
      ) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setSubmitError("");

      try {
        // login API
        await login({
          username:
            form.username.trim(),
          password:
            form.password,
        });

      // fetch logged in user
        const user = await getUser();

        if (!user) {
          throw new Error(
            "Failed to load user."
          );
        }

        // update context instantly
        setUser(user);

        // redirect
        navigate(
          redirectPath,
          { replace: true }
        );

      } catch (error) {
        if (error?.fieldErrors) {
          setErrors((previous) => ({ ...previous, ...error.fieldErrors }));
        }

        setSubmitError(
          error?.message ||
          "Invalid username or password."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Use your account to continue."
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {submitError ? (
          <div style={submitBannerStyle} role="alert">
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Sign in failed</div>
            {submitError}
          </div>
        ) : null}

        <div>
          <label htmlFor="login-username" style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>
            Username or email
          </label>
          <input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange("username")}
            aria-invalid={Boolean(errors.username)}
            placeholder="Enter username or email"
            style={getInputStyle(Boolean(errors.username))}
          />
          {errors.username ? <p style={errorStyle}>{errors.username}</p> : null}
        </div>

        <div>
          <label htmlFor="login-password" style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>
            Password
          </label>
          <div style={passwordFieldStyle}>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange("password")}
              aria-invalid={Boolean(errors.password)}
              placeholder="Enter password"
              style={getPasswordInputStyle(Boolean(errors.password))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              style={toggleButtonStyle}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? <p style={errorStyle}>{errors.password}</p> : null}
        </div>

        <button type="submit" disabled={isSubmitting} style={buttonStyle}>
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "13px" }}>
          <Link to="/register" state={location.state}>
            Create account
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

export default Login;