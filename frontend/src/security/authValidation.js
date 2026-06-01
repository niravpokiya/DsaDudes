export const validateLoginForm = ({ username, password }) => {
  const errors = {};

  if (!username.trim()) {
    errors.username = "Username is required.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

export const validateRegisterForm = ({ username, email, password, confirmPassword }) => {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  if (!username.trim()) {
    errors.username = "Username is required.";
  } else if (username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (!passwordPattern.test(password)) {
    errors.password = "Use at least 8 characters with letters and numbers.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};