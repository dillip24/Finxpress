import React, { useState, useRef, useEffect } from "react";
import { FiList, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AccountMenu({ user, onLogout, onSettings }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
  };

  const menuItems = [
    {
      label: "Transaction History",
      icon: <FiList className="mr-2" />,
      onClick: () => navigate("/history"),
      testid: "history",
    },
    {
      label: "Settings",
      icon: <FiSettings className="mr-2" />,
      onClick: onSettings,
      testid: "settings",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 focus:outline-none focus:ring-0"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        type="button"
      >
        <img
          src={user?.profilepicture || "/default-avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-700"
        />
        <span className="text-gray-900 font-medium ml-2">{user?.firstName}</span>
        <FiChevronDown className="text-gray-900" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-gray-800 rounded shadow-lg z-30 py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-label="Account"
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
              role="menuitem"
              tabIndex={0}
              data-testid={item.testid}
              onClick={() => {
                setOpen(false);
                item.onClick && item.onClick();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="border-t border-gray-700 my-1" />
          <button
            className="flex items-center w-full px-4 py-2 text-left text-red-500 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            role="menuitem"
            tabIndex={0}
            data-testid="logout"
            onClick={() => {
              setOpen(false);
              onLogout && onLogout();
            }}
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}