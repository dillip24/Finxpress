import React, { useEffect, useState } from "react";
import client from "../api/client.jsx";

// Simple icon for budget cards
function BudgetIcon() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 mr-3">
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" />
        <rect x="7" y="11" width="10" height="2" rx="1" fill="#fff" />
      </svg>
    </span>
  );
}

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    period: "monthly",
    startDate: "",
    endDate: "",
    categories: [],
    notificationThreshold: 80
  });
  const [progress, setProgress] = useState({});
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [savings, setSavings] = useState([]);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchIncomeHistory();
    fetchSavings();
  }, []);

  async function fetchBudgets() {
    setLoading(true);
    setError("");
    try {
      const res = await client.get("/api/budgets", { withCredentials: true });
      setBudgets(res.data.data || []);
      const progressObj = {};
      await Promise.all(
        (res.data.data || []).map(async (b) => {
          try {
            const progRes = await client.get(`/api/budgets/${b._id}/progress`, { withCredentials: true });
            progressObj[b._id.toString()] = progRes.data.data;
          } catch {
            progressObj[b._id.toString()] = { spent: 0, percentage: 0 };
          }
        })
      );
      setProgress(progressObj);
    } catch (err) {
      setError("Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await client.get("/api/categories", { withCredentials: true });
      setCategories(res.data.data || []);
    } catch {}
  }

  async function fetchIncomeHistory() {
    try {
      const res = await client.get("/api/transactions?type=income", { withCredentials: true });
      setIncomeHistory(res.data.data || []);
    } catch {
      setIncomeHistory([]);
    }
  }

  async function fetchSavings() {
    try {
      const res = await client.get("/api/transactions?type=savings", { withCredentials: true });
      setSavings(res.data.data || []);
    } catch {
      setSavings([]);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "categories") {
      setForm({ ...form, categories: value ? [value] : [] });
    } else if (name === "notificationThreshold") {
      setForm({ ...form, notificationThreshold: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await client.post("/api/budgets", form, { withCredentials: true });
      setShowForm(false);
      setForm({
        name: "",
        amount: "",
        period: "monthly",
        startDate: "",
        endDate: "",
        categories: [],
        notificationThreshold: 80
      });
      fetchBudgets();
    } catch {
      setError("Failed to create budget.");
    }
  };

  const filteredBudgets =
    filter === "all"
      ? budgets
      : budgets.filter((b) => b.period === filter);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Expense Limits */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Expense Limits</h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold"
                onClick={() => setShowForm((v) => !v)}
              >
                + Set New Limit
              </button>
            </div>
            {showForm && (
              <form className="bg-gray-50 rounded-lg p-4 mb-4 shadow space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 mb-1">Budget Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Budget Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white border border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white border border-gray-300"
                    required
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Period</label>
                  <select
                    name="period"
                    value={form.period}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white border border-gray-300"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Category</label>
                  <select
                    name="categories"
                    value={form.categories[0] || ""}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white border border-gray-300"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-white border border-gray-300"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-white border border-gray-300"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Notification Threshold: <span className="text-blue-600">{form.notificationThreshold}%</span>
                  </label>
                  <input
                    type="range"
                    name="notificationThreshold"
                    min={0}
                    max={100}
                    value={form.notificationThreshold}
                    onChange={handleChange}
                    className="w-full accent-blue-500"
                  />
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                >
                  Create Budget
                </button>
              </form>
            )}
            <div className="flex gap-2 mb-2">
              <label className="text-gray-700 font-semibold">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded p-1"
              >
                <option value="all">All</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            {loading ? (
              <div className="text-gray-500 text-center text-lg mt-6">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center mt-6">{error}</div>
            ) : filteredBudgets.length === 0 ? (
              <div className="text-gray-400 text-center mt-6">No budgets found.</div>
            ) : (
              filteredBudgets.map((b) => (
                <div
                  key={b._id}
                  className="flex items-center bg-gray-100 rounded-lg p-4 shadow mb-2"
                >
                  <BudgetIcon />
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-900">{b.name}</div>
                    <div className="text-gray-500 text-xs">
                      {b.period.charAt(0).toUpperCase() + b.period.slice(1)} &middot; {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-700 mt-1 text-xs">
                      {categories.find((c) => c._id === b.categories[0])?.name || "No Category"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <div className="text-gray-900 text-base font-bold">
                      {progress[b._id?.toString()]?.spent || 0} <span className="text-gray-400 text-sm">/ {b.amount}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {progress[b._id?.toString()]?.spent > b.amount
                        ? <span className="text-red-500">Over budget!</span>
                        : `Limit`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Income History */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Income History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-600 bg-gray-100">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Source</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-gray-400 text-center py-4">No income records</td>
                    </tr>
                  ) : (
                    incomeHistory.slice(0, 10).map((inc) => (
                      <tr key={inc._id} className="border-b border-gray-200">
                        <td className="py-2 px-3">{new Date(inc.date).toLocaleDateString()}</td>
                        <td className="py-2 px-3">{inc.title}</td>
                        <td className="py-2 px-3 font-semibold text-green-600">₹{inc.amount}</td>
                        <td className="py-2 px-3">{inc.paymentMethod || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Savings */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Savings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-600 bg-gray-100">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {savings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-gray-400 text-center py-4">No savings records</td>
                    </tr>
                  ) : (
                    savings.slice(0, 10).map((sav) => (
                      <tr key={sav._id} className="border-b border-gray-200">
                        <td className="py-2 px-3">{new Date(sav.date).toLocaleDateString()}</td>
                        <td className="py-2 px-3">{sav.title}</td>
                        <td className="py-2 px-3 font-semibold text-blue-600">₹{sav.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}