import React, { useEffect, useState } from "react";
import client from "../api/client.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    color: "#000000"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await client.get("/api/categories", { withCredentials: true });
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await client.post("/api/categories", form, { withCredentials: true });
      setForm({ name: "", type: "expense", color: "#000000" });
      setSuccess("Category added!");
      fetchCategories();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to add category. Name must be unique per user."
      );
    }
  };

  // Delete category handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setError("");
    setSuccess("");
    try {
      await client.delete(`/api/categories/${id}`, { withCredentials: true });
      setSuccess("Category deleted!");
      fetchCategories();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete category."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-50 min-h-screen rounded-lg shadow">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>
      <form
        className="bg-white rounded-lg p-6 mb-8 shadow space-y-4 border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            value={form.name}
            onChange={handleChange}
            className="flex-1 p-2 rounded bg-gray-100 border border-gray-300 text-gray-900"
            required
            maxLength={50}
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="flex-1 p-2 rounded bg-gray-100 border border-gray-300 text-gray-900"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="savings">Savings</option>
          </select>
          <input
            type="color"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="w-12 h-12 p-1 rounded border border-gray-300"
            title="Pick a color"
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
        >
          Add Category
        </button>
      </form>
      <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Categories</h2>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-gray-400">No categories found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl shadow p-6 border border-gray-200 relative"
              >
                <span
                  className="inline-block w-12 h-12 rounded-full mb-3 border-2"
                  style={{
                    background: cat.color,
                    borderColor: "#bbb"
                  }}
                  title={cat.color}
                ></span>
                <div className="text-xl font-semibold text-gray-900 mb-1">{cat.name}</div>
                <div className="text-gray-500 capitalize mb-1">{cat.type}</div>
                <div className="text-xs text-gray-400">Color: {cat.color}</div>
                <div className="text-xs text-yellow-600 break-all mt-2">ID: {cat._id}</div>
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow"
                  title="Delete Category"
                  onClick={() => handleDelete(cat._id)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}