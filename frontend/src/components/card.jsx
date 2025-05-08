import React from 'react';
export default function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded shadow flex items-center">
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
