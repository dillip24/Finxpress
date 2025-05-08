import React from 'react';

export default function Table({ columns, data }) {
  return (
    <table className="min-w-full bg-white rounded shadow overflow-hidden">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((c) => (
            <th key={c.accessor} className="p-2 text-left text-sm text-gray-600">{c.Header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-t">
            {columns.map((c) => (
              <td key={c.accessor} className="p-2 text-sm">{row[c.accessor]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
