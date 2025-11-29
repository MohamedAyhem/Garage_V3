import React from "react";
import ServiceMultiSelect from "./ServiceMultiSelect";

const GarageForm = ({
  title,
  name,
  setName,
  location,
  setLocation,
  coordinates,
  getCurrentLocation,
  locationLoading,
  description,
  setDescription,
  capacity,
  setCapacity,
  open,
  setOpen,
  close,
  setClose,
  images,
  setImages,
  services,
  selectedServices,
  toggleService,
  serviceSearchTerm,
  setServiceSearchTerm,
  serviceDropdownOpen,
  setServiceDropdownOpen,
  onCreateService,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditMode = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg my-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Garage Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <div className="relative">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-2 rounded pr-10"
            required
            readOnly
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            title="Get current location"
          >
            {locationLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <i className="fa-solid fa-location-crosshairs text-lg"></i>
            )}
          </button>
        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Open (hour)"
            value={open}
            onChange={(e) => setOpen(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Close (hour)"
            value={close}
            onChange={(e) => setClose(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages([...e.target.files])}
          className="w-full border p-2 rounded"
          required={!isEditMode}
        />
        {isEditMode && (
          <p className="text-xs text-gray-500">
            Leave empty to keep existing images, or upload new ones to replace them
          </p>
        )}

        <ServiceMultiSelect
          services={services}
          selectedServices={selectedServices}
          onToggleService={toggleService}
          serviceSearchTerm={serviceSearchTerm}
          onSearchChange={setServiceSearchTerm}
          isOpen={serviceDropdownOpen}
          onToggle={() => setServiceDropdownOpen(!serviceDropdownOpen)}
          onCreateService={onCreateService}
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Garage"
              : "Add Garage"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GarageForm;

