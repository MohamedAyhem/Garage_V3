import React from "react";

const ServicesPopup = ({ isOpen, onClose, garage, garages }) => {
  if (!isOpen || !garage) return null;

  const garageData = garages.find((g) => g._id === garage);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            All Services ({garageData?.services?.length || 0})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          {garageData?.services?.map((service) => (
            <div
              key={service._id}
              className="p-3 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-800">{service.name}</h3>
              {/* {service.description && (
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPopup;
