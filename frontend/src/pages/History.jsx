import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await client.get("/api/transactions/", { withCredentials: true });
        setTransactions(res.data.data || []);
      } catch (err) {
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  // Fetch extra details when a transaction is selected
  useEffect(() => {
    if (!selectedTx) {
      setDetails(null);
      return;
    }
    setDetailsLoading(true);
    client
      .get(`/api/transactions/${selectedTx._id}`, { withCredentials: true })
      .then((res) => setDetails(res.data.data))
      .catch(() => setDetails(null))
      .finally(() => setDetailsLoading(false));
  }, [selectedTx]);

  if (loading) {
    return <div className="text-center text-xl mt-10 text-gray-700">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedTx(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction Details</h2>
            {detailsLoading ? (
              <div className="text-gray-500">Loading details...</div>
            ) : details ? (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-gray-700">Title:</span> {details.title}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Amount:</span> ₹{details.amount}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Type:</span>{" "}
                  <span
                    className={
                      details.type === "income"
                        ? "text-green-600 font-semibold"
                        : details.type === "expense"
                        ? "text-red-500 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {details.type}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Date:</span>{" "}
                  {new Date(details.date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Category:</span>{" "}
                  {details.category?.name || "-"}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Description:</span>{" "}
                  {details.description || "-"}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Payment Method:</span>{" "}
                  {details.paymentMethod || "-"}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Tags:</span>{" "}
                  {details.tags && details.tags.length > 0
                    ? details.tags.join(", ")
                    : "-"}
                </div>
                {details.isRecurring && (
                  <div>
                    <span className="font-semibold text-gray-700">Recurring:</span>{" "}
                    {details.recurringDetails?.frequency || "Yes"}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-500">Failed to load details.</div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white min-h-[70vh] rounded-2xl shadow p-8 border border-gray-200 flex flex-col">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="text-gray-500 text-center flex-1 flex items-center justify-center">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full table-auto border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border-b text-left font-semibold">Date</th>
                  <th className="p-3 border-b text-left font-semibold">Title</th>
                  <th className="p-3 border-b text-left font-semibold">Amount</th>
                  <th className="p-3 border-b text-left font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-blue-50 transition-colors border-b border-gray-200 text-gray-800 cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="p-3">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-3">{tx.title}</td>
                    <td className="p-3">
                      <span className="font-semibold">
                        ₹{tx.amount}
                      </span>
                    </td>
                    <td className="p-3 capitalize">
                      <span
                        className={
                          tx.type === "income"
                            ? "text-green-600 font-semibold"
                            : tx.type === "expense"
                            ? "text-red-500 font-semibold"
                            : "text-gray-700"
                        }
                      >
                        {tx.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}