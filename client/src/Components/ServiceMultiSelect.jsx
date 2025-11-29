import React from "react";

const ServiceMultiSelect = ({
  services,
  selectedServices,
  onToggleService,
  serviceSearchTerm,
  onSearchChange,
  isOpen,
  onToggle,
  onCreateService,
}) => {
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <label className="font-semibold">Services *</label>
        <button
          type="button"
          onClick={onCreateService}
          className="text-sm bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600"
        >
          + Create New Service
        </button>
      </div>

      <div className="relative service-dropdown-container">
        <button
          type="button"
          onClick={onToggle}
          className="w-full border p-2 rounded text-left bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-sm text-gray-600">
            {selectedServices.length > 0
              ? `${selectedServices.length} service(s) selected`
              : "Select services..."}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b sticky top-0 bg-white z-10">
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Services List */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredServices.length === 0 ? (
                <p className="text-sm text-gray-500 p-3 text-center">
                  No services found. Create one first.
                </p>
              ) : (
                filteredServices.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => onToggleService(service._id)}
                    className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer ${
                      selectedServices.includes(service._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service._id)}
                      onChange={() => {}}
                      className="cursor-pointer"
                      readOnly
                    />
                    <span className="text-sm">{service.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selectedServices.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedServices.map((serviceId) => {
            const service = services.find((s) => s._id === serviceId);
            return service ? (
              <span
                key={serviceId}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {service.name}
                <button
                  type="button"
                  onClick={() => onToggleService(serviceId)}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceMultiSelect;
