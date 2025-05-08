import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      console.log("Logged in!")
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-6 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-6 text-center text-gray-700">
          New user?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
}