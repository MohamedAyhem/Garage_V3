import React, { useContext } from "react";
import { GarageContext } from "../Contexts/GarageContext";

const GarageCardItem = ({
  garage,
  openMenuId,
  onMenuClick,
  onEdit,
  onDelete,
  onViewAllServices,
  onServicesClick,
}) => {
  const { selectedGarageId, handleSelectGarage } = useContext(GarageContext);
  const isSelected = selectedGarageId === garage._id;

  return (
    <div
      className={`p-5 border-2 rounded-xl shadow-md bg-white relative group max-w-sm mx-auto transition-all ${
        isSelected
          ? "border-yellow-400 shadow-lg shadow-yellow-300/50"
          : "border-black"
      }`}
      onMouseLeave={() => onMenuClick(null)}
    >
      {/* Selected Garage Badge */}
      {isSelected && (
        <div className="absolute -top-3 -left-3 z-30">
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-400 text-black rounded-full border-2 border-black shadow-md">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
      <div className="relative mb-3">
        <img
          src={garage.photos?.[0] || "/default-garage.jpg"}
          alt={garage.name}
          className="w-full h-40 object-cover rounded-lg"
        />

        <div className="absolute top-2 right-2 menu-container z-10 bg-white/80 rounded-full p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(openMenuId === garage._id ? null : garage._id);
            }}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            title="Options"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {openMenuId === garage._id && (
            <div className="absolute top-10 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectGarage(garage._id);
                  onMenuClick(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-t-lg font-semibold border-b border-gray-200"
              >
                {selectedGarageId === garage._id
                  ? "✓ Active Garage"
                  : "Switch to Garage"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(garage);
                  onMenuClick(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(garage._id);
                  onMenuClick(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
              >
                Delete
              </button>
              {garage.services && garage.services.length > 4 && (
                <>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAllServices(garage._id);
                      onMenuClick(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    View All Services
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold text-black mb-2">{garage.name}</h2>

      <p className="text-gray-700 font-medium mb-2">
        Capacity:{" "}
        <span className="text-yellow-500 font-bold">{garage.capacity}</span>
      </p>

      <p className="text-gray-600 text-sm mb-2">Location: {garage.location}</p>

      {garage.services && garage.services.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 font-semibold mb-1">Services:</p>
          <div className="flex flex-wrap gap-1">
            {garage.services.slice(0, 4).map((service) => (
              <span
                key={service._id}
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
              >
                {service.name}
              </span>
            ))}
            {garage.services.length > 4 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServicesClick(garage._id);
                }}
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 cursor-pointer"
              >
                +{garage.services.length - 4} more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GarageCardItem;
