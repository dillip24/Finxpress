import React, { useEffect, useState } from 'react';
import client from '../api/client.jsx';
import Card from '../components/card.jsx';
import Chart from '../components/chart.jsx';

export default function Overview() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Add state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [categories, setCategories] = useState([]);
  const [quickAdd, setQuickAdd] = useState({
    title: "",
    amount: "",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    description: "",
    paymentMethod: "",
    tags: "",
    isRecurring: false,
    frequency: "monthly",
    endDate: ""
  });
  const [quickAddError, setQuickAddError] = useState("");
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await client.get('api/dashboard/summary');
        setSummary(res.data.data);
        setRecent(res.data.data?.recentTransactions || []);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  // Fetch categories for quick add
  useEffect(() => {
    if (showQuickAdd) {
      client.get("api/categories", { withCredentials: true })
        .then(res => setCategories(res.data.data || []))
        .catch(() => setCategories([]));
    }
  }, [showQuickAdd]);

  const handleQuickAddChange = (e) => {
    const { name, value } = e.target;
    setQuickAdd((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    setQuickAddError("");
    setQuickAddLoading(true);
    try {
      const payload = {
        ...quickAdd,
        tags: quickAdd.tags
          ? quickAdd.tags.split(",").map(t => t.trim()).filter(Boolean)
          : [],
        recurringDetails: quickAdd.isRecurring
          ? {
              frequency: quickAdd.frequency || "monthly",
              endDate: quickAdd.endDate || null
            }
          : undefined
      };
      await client.post("/api/transactions", payload, { withCredentials: true });
      setShowQuickAdd(false);
      setQuickAdd({
        title: "",
        amount: "",
        type: "expense",
        date: new Date().toISOString().slice(0, 10),
        category: "",
        description: "",
        paymentMethod: "",
        tags: "",
        isRecurring: false,
        frequency: "monthly",
        endDate: ""
      });
      // Refresh summary and recent transactions
      const res = await client.get('api/dashboard/summary');
      setSummary(res.data.data);
      setRecent(res.data.data?.recentTransactions || []);
    } catch (err) {
      setQuickAddError("Failed to add transaction.");
    } finally {
      setQuickAddLoading(false);
    }
  };

  if (loading || !summary) return <p className="text-gray-700">Loading...</p>;

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowQuickAdd(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Add Transaction</h2>
            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={quickAdd.title}
                  onChange={handleQuickAddChange}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  required
                  maxLength={100}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={quickAdd.amount}
                  onChange={handleQuickAddChange}
                  className="w-1/2 p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  required
                  min={0}
                />
                <select
                  name="type"
                  value={quickAdd.type}
                  onChange={handleQuickAddChange}
                  className="w-1/2 p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="savings">Savings</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <input
                  type="date"
                  name="date"
                  value={quickAdd.date}
                  onChange={handleQuickAddChange}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  required
                />
              </div>
              <div>
                <select
                  name="category"
                  value={quickAdd.category}
                  onChange={handleQuickAddChange}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  name="paymentMethod"
                  value={quickAdd.paymentMethod}
                  onChange={handleQuickAddChange}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="credit card">Credit Card</option>
                  <option value="debit card">Debit Card</option>
                  <option value="bank transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={quickAdd.description}
                  onChange={handleQuickAddChange}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  rows={2}
                  maxLength={500}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="tags"
                  placeholder="Tags (comma separated)"
                  value={quickAdd.tags || ""}
                  onChange={e =>
                    setQuickAdd(prev => ({
                      ...prev,
                      tags: e.target.value
                    }))
                  }
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={quickAdd.isRecurring || false}
                  onChange={e =>
                    setQuickAdd(prev => ({
                      ...prev,
                      isRecurring: e.target.checked
                    }))
                  }
                  className="accent-blue-600"
                />
                <label className="text-gray-700">Recurring</label>
              </div>
              {quickAdd.isRecurring && (
                <div className="flex gap-2">
                  <select
                    name="frequency"
                    value={quickAdd.frequency || "monthly"}
                    onChange={e =>
                      setQuickAdd(prev => ({
                        ...prev,
                        frequency: e.target.value
                      }))
                    }
                    className="w-1/2 p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <input
                    type="date"
                    name="endDate"
                    value={quickAdd.endDate || ""}
                    onChange={e =>
                      setQuickAdd(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))
                    }
                    className="w-1/2 p-2 rounded bg-gray-100 border border-gray-300 text-gray-800"
                    placeholder="Recurring End Date"
                  />
                </div>
              )}
              {quickAddError && <div className="text-red-500">{quickAddError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                disabled={quickAddLoading}
              >
                {quickAddLoading ? "Adding..." : "Add Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow"
          onClick={() => setShowQuickAdd(true)}
        >
          + Quick Add
        </button>
      </div>
      <p className="text-gray-500 mb-8">A snapshot of your financial health</p>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card
          title="Income"
          value={`₹${summary.monthlyIncome}`}
          icon={<span className="text-2xl">💼</span>}
          className="bg-white text-teal-600 border border-gray-200"
        />
        <Card
          title="Expenses"
          value={`₹${summary.monthlyExpenses}`}
          icon={<span className="text-2xl">💸</span>}
          className="bg-white text-pink-600 border border-gray-200"
        />
        <Card
          title="Balance"
          value={`₹${summary.balance}`}
          icon={<span className="text-2xl">⚖️</span>}
          className="bg-white text-cyan-600 border border-gray-200"
        />
        <Card
          title="Savings"
          value={`₹${summary.monthlySavings}`}
          icon={<span className="text-2xl">🐷</span>}
          className="bg-white text-green-600 border border-gray-200"
        />
        <Card
          title="Investments"
          value={`₹${summary.investments || 0}`}
          icon={<span className="text-2xl">💲</span>}
          className="bg-white text-blue-600 border border-gray-200"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mini Trend Chart */}
        <div className="md:col-span-2 bg-white rounded-lg p-6 shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending vs Income Trend</h2>
          <Chart
            data={{
              labels: recent.slice(0, 10).map((t) => new Date(t.date).toLocaleDateString()),
              datasets: [
                {
                  label: 'Expenses',
                  data: recent.slice(0, 10).map((t) => t.type === 'expense' ? t.amount : 0),
                  borderColor: 'rgba(239, 68, 68, 1)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Income',
                  data: recent.slice(0, 10).map((t) => t.type === 'income' ? t.amount : 0),
                  borderColor: 'rgba(16, 185, 129, 1)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4,
                  fill: true,
                }
              ]
            }}
            options={{
              plugins: {
                legend: { labels: { color: "#222" } }
              },
              scales: {
                x: { ticks: { color: "#222" } },
                y: { ticks: { color: "#222" } }
              }
            }}
          />
        </div>
        {/* Recent Transactions Table */}
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {recent.length === 0 ? (
            <div className="text-gray-400">No recent transactions</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.slice(0, 5).map((t) => (
                  <tr key={t._id} className="border-t border-gray-200 text-gray-800">
                    <td className="py-1">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-1">{t.title}</td>
                    <td className="py-1 capitalize">{t.type}</td>
                    <td className="py-1">{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}