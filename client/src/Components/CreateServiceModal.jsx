import React from "react";

const CreateServiceModal = ({
  isOpen,
  onClose,
  newServiceName,
  setNewServiceName,
  newServiceDescription,
  setNewServiceDescription,
  newServiceImages,
  setNewServiceImages,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Service</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Service Name *"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            placeholder="Description"
            value={newServiceDescription}
            onChange={(e) => setNewServiceDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewServiceImages([...e.target.files])}
            className="w-full border p-2 rounded"
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-black rounded font-semibold"
            >
              Create Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceModal;

