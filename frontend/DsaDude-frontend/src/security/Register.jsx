import React, { useState } from 'react';

const Register = ({ onSuccess, onToggle }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optionally store token if backend returns it
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        if (onSuccess) onSuccess();
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Create your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
         <label className="block text-sm mb-1">Username</label>
        <input
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm text-secondary text-center">
        Already have an account?{' '}
        <button type="button" className="text-accent btn-ghost" onClick={onToggle}>
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Register;


