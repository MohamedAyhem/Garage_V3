import React from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

const MechanicTable = ({
  mechanics,
  page,
  itemsPerPage,
  showPassword,
  onTogglePassword,
  copiedPassword,
  onCopyPassword,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-2 py-2">No</th>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Email</th>
            <th className="px-2 py-2">Password</th>
            <th className="px-2 py-2">Salary</th>
            <th className="px-2 py-2">Hours</th>
            <th className="px-2 py-2">Tasks Assigned</th>
            <th className="px-2 py-2">Tasks Completed</th>
            <th className="px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mechanics.map((m, index) => (
            <tr key={m._id} className="border-b border-gray-200">
              <td className="px-2 py-2">
                {(page - 1) * itemsPerPage + index + 1}
              </td>
              <td className="px-2 py-2">{m.name}</td>
              <td className="px-2 py-2">{m.email}</td>
              <td className="px-2 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm">
                    {showPassword[m._id] ? m.password || "N/A" : "••••••••••••"}
                  </span>
                  <button
                    onClick={() => onTogglePassword(m._id)}
                    className="text-gray-600 hover:text-gray-800 p-0.5"
                    title={
                      showPassword[m._id] ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword[m._id] ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {m.password && (
                    <button
                      onClick={() => onCopyPassword(m.password, m._id)}
                      className="text-gray-600 hover:text-gray-800 p-0.5"
                      title="Copy password"
                    >
                      {copiedPassword[m._id] ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </td>
              <td className="px-2 py-2">{m.salary} dt</td>
              <td className="px-2 py-2">{m.hours} hrs</td>
              <td className="px-2 py-2">
                <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold">
                  {m.tasksAssigned || 0}
                </span>
              </td>
              <td className="px-2 py-2">
                <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-semibold">
                  {m.tasksCompleted || 0}
                </span>
              </td>
              <td className="px-2 py-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(m)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(m._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {mechanics.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center px-2 py-4 text-gray-500">
                No mechanics found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MechanicTable;
