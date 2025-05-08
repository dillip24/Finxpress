import React, { useEffect, useState } from "react";
import client from "../api/client.jsx";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch only recurring expense transactions
  useEffect(() => {
    async function fetchBills() {
      setLoading(true);
      setError("");
      try {
        const res = await client.get(
          "/api/transactions?type=expense",
          { withCredentials: true }
        );
        // Only recurring transactions
        setBills((res.data.data || []).filter(tx => tx.isRecurring));
      } catch {
        setError("Failed to load recurring bills.");
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

  // Mark bill as paid/unpaid (toggle)
  const handlePaidToggle = async (bill) => {
    try {
      await client.put(
        `/api/transactions/${bill._id}`,
        { isPaid: !bill.isPaid },
        { withCredentials: true }
      );
      setBills((prev) =>
        prev.map((b) =>
          b._id === bill._id ? { ...b, isPaid: !bill.isPaid } : b
        )
      );
    } catch {
      setError("Failed to update bill status.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen rounded-lg shadow">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Recurring Bills</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : bills.length === 0 ? (
        <div className="text-gray-400">No recurring bills found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className={`rounded-xl shadow p-5 border transition ${
                bill.isPaid
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-gray-900">{bill.title}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    bill.isPaid
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {bill.isPaid ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="text-gray-700 mb-1">
                <span className="font-semibold">Amount:</span> ₹{bill.amount}
              </div>
              <div className="text-gray-700 mb-1">
                <span className="font-semibold">Due Date:</span>{" "}
                {bill.date ? new Date(bill.date).toLocaleDateString() : "-"}
              </div>
              <div className="text-gray-700 mb-1">
                <span className="font-semibold">Frequency:</span>{" "}
                {bill.recurringDetails?.frequency || "monthly"}
              </div>
              {bill.recurringDetails?.endDate && (
                <div className="text-gray-700 mb-1">
                  <span className="font-semibold">Ends:</span>{" "}
                  {new Date(bill.recurringDetails.endDate).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center mt-3">
                <input
                  type="checkbox"
                  checked={!!bill.isPaid}
                  onChange={() => handlePaidToggle(bill)}
                  className="w-5 h-5 accent-blue-600 mr-2"
                  title="Mark as paid"
                  id={`paid-${bill._id}`}
                />
                <label
                  htmlFor={`paid-${bill._id}`}
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  Mark as paid
                </label>
              </div>
              <div className="text-gray-500 text-xs mt-2">
                Transaction ID: {bill._id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}