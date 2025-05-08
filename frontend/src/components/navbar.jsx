import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiSearch, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import AccountMenu from "./AccountMenu";

export default function Navbar({ user }) {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Updated notifications: only type, no link/linkText, and new messages
  const notifications = [
    {
      id: 1,
      type: "Budget Exceeded",
      text: "You have exceeded your budget for groceries.",
      date: "2025-05-08",
    },
    {
      id: 2,
      type: "Recurring Bill Added",
      text: "Electricity bill has been added as a recurring bill.",
      date: "2025-05-08",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${search}`);
  };

  const handleSettings = () => navigate("/settings");
  const handleLogout = async () => await logout();

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-gray-100 rounded px-3 py-1 w-1/3 border border-gray-300"
      >
        <FiSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none text-gray-800 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <div className="relative">
          <button
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Show notifications"
          >
            <FiBell size={22} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1 text-white">
              {notifications.length}
            </span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[370px] max-h-[420px] overflow-y-auto bg-white rounded shadow-lg z-10 border border-gray-200">
              <div className="p-4 border-b border-gray-200 text-gray-900 font-semibold text-base">
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-400">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-green-400" />
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium mb-1">
                        <span className="font-semibold text-blue-600">{n.type}:</span> {n.text}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{n.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile / Login */}
        {user ? (
          <AccountMenu
            user={user}
            onLogout={handleLogout}
            onSettings={handleSettings}
          />
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 focus:outline-none focus:ring-0 text-gray-600 hover:text-gray-900 px-3 py-1 rounded bg-gray-100 border border-gray-300"
          >
            <FiUser />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}