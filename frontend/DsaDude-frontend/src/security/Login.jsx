import React, { useState } from 'react';

const Login = ({ onSuccess, onToggle }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call API Gateway, which forwards to User Service
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token returned by backend
        localStorage.setItem("token", data.token);
        // Optionally store user info
        localStorage.setItem("user", JSON.stringify(data.user));

        // Call parent success handler
        if (onSuccess) onSuccess();
      } else {
        // Handle errors from backend
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Sign in to your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-sm text-secondary text-center">
        Don&apos;t have an account?{' '}
        <button type="button" className="text-accent btn-ghost" onClick={onToggle}>
          Create one
        </button>
      </p>
    </div>
  );
};

export default Login;


