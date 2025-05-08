import React, { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    phonenumber: "",
    profilepicture: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "profilepicture") {
      setForm({ ...form, profilepicture: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      await client.post("/api/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess("Registration successful! You can now log in.");
      setForm({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        phonenumber: "",
        profilepicture: null
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
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
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
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
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          name="phonenumber"
          placeholder="Phone Number"
          value={form.phonenumber}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="file"
          name="profilepicture"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="w-full mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <div className="mt-6 text-center text-gray-700">
          Old user?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Go to login
          </Link>
        </div>
      </form>
    </div>
  );
}