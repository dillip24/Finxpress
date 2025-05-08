import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const items = [
  { to: '/overview', label: 'Overview' },
  { to: '/budget', label: 'Budget' },
  { to: '/category', label: 'Category' },
  { to: '/report', label: 'Report' },
  { to: '/bills', label: 'Bills' },
  
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white shadow h-full">
      <div className="p-4 font-bold text-xl">
        <Link to="/" className="hover:underline">FinExpress</Link>
      </div>
      <nav className="mt-6">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block py-2 px-4 hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}