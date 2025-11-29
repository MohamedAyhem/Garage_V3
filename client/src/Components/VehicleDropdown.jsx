import { useState, useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { carApiService, setAuthToken } from "../utils/apiService";

const VehicleDropdown = ({
  selectedVehicle,
  setSelectedVehicle,
  setShowVehiclePopup,
}) => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadUserVehicles = async () => {
      if (isSignedIn && user) {
        setLoading(true);
        try {
          const token = await getToken();
          setAuthToken(token);
          const response = await carApiService.getUserVehicles();
          setSavedVehicles(response || []); // Response is the array of cars

          const defaultVehicle =
            response?.find((vehicle) => vehicle.isDefault) || response?.[0];
          if (defaultVehicle && !selectedVehicle) {
            setSelectedVehicle(defaultVehicle);
          }
        } catch (error) {
          console.error("Failed to load user vehicles:", error);
          setSavedVehicles([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSelectedVehicle(null);
        setSavedVehicles([]);
      }
    };

    loadUserVehicles();

    const handleVehicleAdded = () => {
      loadUserVehicles();
    };

    window.addEventListener("vehicleAdded", handleVehicleAdded);

    return () => {
      window.removeEventListener("vehicleAdded", handleVehicleAdded);
    };
  }, [isSignedIn, user, setSelectedVehicle]);

  const selectVehicle = async (vehicle) => {
    try {
      const token = await getToken();
      setAuthToken(token);

      await carApiService.setDefaultVehicle(vehicle._id);

      const updatedVehicles = savedVehicles.map((v) => ({
        ...v,
        isDefault: v._id === vehicle._id,
      }));

      setSavedVehicles(updatedVehicles);
      setSelectedVehicle(vehicle);
      setShowVehicleDropdown(false);
    } catch (error) {
      console.error("Failed to set default vehicle:", error);
      setSelectedVehicle(vehicle);
      setShowVehicleDropdown(false);
    }
  };

  const removeVehicle = async (vehicleToRemove) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await carApiService.deleteVehicle(vehicleToRemove._id);

      const updatedVehicles = savedVehicles.filter(
        (v) => v._id !== vehicleToRemove._id
      );
      setSavedVehicles(updatedVehicles);

      if (selectedVehicle && selectedVehicle._id === vehicleToRemove._id) {
        if (updatedVehicles.length > 0) {
          const newDefault =
            updatedVehicles.find((v) => v.isDefault) || updatedVehicles[0];
          setSelectedVehicle(newDefault);
        } else {
          setSelectedVehicle(null);
          setShowVehiclePopup(true);
        }
      }
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  const deleteAllVehicles = async () => {
    if (!savedVehicles.length) return;

    if (
      !confirm(
        `Are you sure you want to delete ALL ${savedVehicles.length} vehicles? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = await getToken();
      setAuthToken(token);

      for (const vehicle of savedVehicles) {
        await carApiService.deleteVehicle(vehicle._id);
      }

      setSavedVehicles([]);
      setSelectedVehicle(null);
      setShowVehiclePopup(true);
      setShowVehicleDropdown(false);
    } catch (error) {
      console.error("Failed to delete all vehicles:", error);
    }
  };

  const clearVehicle = () => {
    setSelectedVehicle(null);
    setShowVehiclePopup(true);
    setShowVehicleDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowVehicleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDisplayText = (vehicle) => {
    return vehicle
      ? `${vehicle.year} ${vehicle.brand} ${vehicle.model}`
      : "Select Vehicle";
  };

  if (!isSignedIn) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
        className="flex items-center gap-1 md:gap-2 hover:text-[#1A1A1A] transition-colors px-2 md:px-3 py-1 rounded-lg hover:bg-[#e6c801]"
      >
        <i className="fa-solid fa-car"></i>
        {selectedVehicle ? (
          <span className="hidden md:inline max-w-[200px] truncate">
            {getDisplayText(selectedVehicle)}
          </span>
        ) : (
          <span className="hidden md:inline">Select Vehicle</span>
        )}
        <i
          className={`fa-solid fa-chevron-down transition-transform duration-200 ${
            showVehicleDropdown ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {showVehicleDropdown && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-[#1A1A1A] rounded-lg shadow-2xl border border-[#FFDE01] overflow-hidden z-[1000] max-md:fixed max-md:left-1/2 max-md:-translate-x-1/2 max-md:mt-16 max-md:-translate-y-1/2 max-md:w-[90vw]">
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setShowVehiclePopup(true);
                  setShowVehicleDropdown(false);
                }}
                className="flex-1 bg-[#FFDE01] text-black font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#e6c801] transition-colors"
              >
                <i className="fa-solid fa-plus"></i>
                Add Vehicle
              </button>
              {savedVehicles.length > 0 && (
                <button
                  onClick={deleteAllVehicles}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                  title="Delete all vehicles"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {loading ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Loading vehicles...
                </p>
              ) : savedVehicles.length > 0 ? (
                savedVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className={`flex items-center justify-between p-3 rounded-lg group transition-all ${
                      selectedVehicle && selectedVehicle._id === vehicle._id
                        ? "bg-[#FFDE01] text-black"
                        : "bg-white/5 text-white hover:bg-white/10"
                    } ${
                      vehicle.isDefault ? "border-l-4 border-l-[#FFDE01]" : ""
                    }`}
                  >
                    <button
                      onClick={() => selectVehicle(vehicle)}
                      className="flex-1 text-left text-sm truncate"
                    >
                      <div className="flex items-center gap-2">
                        {vehicle.year} {vehicle.brand} {vehicle.model}
                        {vehicle.isDefault && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-75">
                        {vehicle.plate && `Plate: ${vehicle.plate} • `}
                        {vehicle.mileage
                          ? `${vehicle.mileage}km`
                          : "No mileage"}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVehicle(vehicle);
                      }}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        selectedVehicle && selectedVehicle._id === vehicle._id
                          ? "text-gray-700"
                          : "text-red-400"
                      }`}
                      title="Remove vehicle"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  No saved vehicles yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDropdown;
