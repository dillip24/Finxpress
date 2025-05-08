import React, { useEffect, useState } from "react";
import client from "../api/client.jsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Report() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [catRes, budRes, txRes] = await Promise.all([
        client.get("/api/categories", { withCredentials: true }),
        client.get("/api/budgets", { withCredentials: true }),
        client.get("/api/transactions", { withCredentials: true }),
      ]);
      setCategories(catRes.data.data || []);
      setBudgets(budRes.data.data || []);
      setTransactions(txRes.data.data || []);
    } finally {
      setLoading(false);
    }
  }

  // Prepare data for chart
  const categoryNames = categories.map((cat) => cat.name);

  // Budget allocated per category (first budget found for that category)
  const budgetAllocated = categories.map((cat) => {
    const budget = budgets.find(
      (b) => b.categories && b.categories[0] === cat._id
    );
    return budget ? Number(budget.amount) : 0;
  });

  // Actual spent per category (sum of all expense transactions for that category)
  const spentPerCategory = categories.map((cat) => {
    return transactions
      .filter(
        (tx) =>
          tx.category === cat._id &&
          tx.type === "expense"
      )
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  });

  // Trend analysis: last 6 months spending per category
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const trendData = categories.map((cat) => {
    return months.map((month) => {
      return transactions
        .filter(
          (tx) =>
            tx.category === cat._id &&
            tx.type === "expense" &&
            tx.date &&
            tx.date.startsWith(month)
        )
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
    });
  });

  const barData = {
    labels: categoryNames,
    datasets: [
      {
        label: "Budget Allocated",
        data: budgetAllocated,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderRadius: 6,
        barThickness: 32,
      },
      {
        label: "Actual Spent",
        data: spentPerCategory,
        backgroundColor: "rgba(37, 99, 235, 0.7)",
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  };

  const trendChartData = {
    labels: months,
    datasets: categories.map((cat, idx) => ({
      label: cat.name,
      data: trendData[idx],
      backgroundColor: categories[idx].color || `hsl(${idx * 40}, 70%, 60%)`,
      borderColor: categories[idx].color || `hsl(${idx * 40}, 70%, 40%)`,
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 24,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen rounded-lg shadow">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Budget Report</h1>
      {loading ? (
        <div className="text-gray-500 text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full min-w-[350px]">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Budget Comparison
            </h2>
            <div className="w-full min-w-[300px]">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Amount" },
                      grid: { color: "#e5e7eb" },
                      ticks: { color: "#6b7280" },
                    },
                    x: {
                      grid: { color: "#f3f4f6" },
                      ticks: { color: "#6b7280" },
                    },
                  },
                }}
                height={350}
              />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full min-w-[350px]">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Category Spending Trend (Last 6 Months)
            </h2>
            <div className="w-full min-w-[300px]">
              <Bar
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Amount" },
                      grid: { color: "#e5e7eb" },
                      ticks: { color: "#6b7280" },
                    },
                    x: {
                      title: { display: true, text: "Month" },
                      grid: { color: "#f3f4f6" },
                      ticks: { color: "#6b7280" },
                    },
                  },
                }}
                height={350}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}