import React from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

const MechanicModal = ({
  isOpen,
  onClose,
  isAddMode,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editSalary,
  setEditSalary,
  editHours,
  setEditHours,
  generatedPassword,
  onGeneratePassword,
  showPassword,
  onTogglePassword,
  copiedPassword,
  onCopyPassword,
  onSubmit,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-semibold mb-4">
          {isAddMode ? "Add Mechanic" : "Edit Mechanic"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {isAddMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  placeholder="Click Generate to create password"
                  className="flex-1 p-2 border rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={onGeneratePassword}
                  className="px-4 py-2 text-black bg-yellow-300 hover:bg-yellow-400 font-semibold rounded-lg whitespace-nowrap"
                >
                  Generate
                </button>
                {generatedPassword && (
                  <button
                    type="button"
                    onClick={() => onCopyPassword(generatedPassword, "new")}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    title="Copy password"
                  >
                    {copiedPassword["new"] ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary (dt)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editSalary}
              onChange={(e) => setEditSalary(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editHours}
              onChange={(e) => setEditHours(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-black bg-yellow-300 hover:bg-yellow-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? isAddMode
                ? "Adding..."
                : "Saving..."
              : isAddMode
              ? "Add"
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MechanicModal;
