import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";

const LocationDropdown = ({
  userAddress,
  setUserAddress,
  setShowLocationPopup,
}) => {
  const { isSignedIn, user } = useUser();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUserStorageKey = () => {
    return user ? `userLocation_${user.id}` : "userLocation";
  };

  const getSavedLocationsKey = () => {
    return user ? `savedLocations_${user.id}` : "savedLocations";
  };

  useEffect(() => {
    if (isSignedIn && user) {
      const storageKey = getUserStorageKey();
      const locationsKey = getSavedLocationsKey();
      const storedLocation = localStorage.getItem(storageKey);
      const storedLocations = localStorage.getItem(locationsKey);

      if (storedLocation) {
        try {
          const locationData = JSON.parse(storedLocation);
          setUserAddress(
            typeof locationData === "string"
              ? locationData
              : locationData.address
          );
        } catch (error) {
          console.error("Error parsing stored location:", error);
        }
      }

      if (storedLocations) {
        try {
          const locations = JSON.parse(storedLocations);
          setSavedLocations(locations);
        } catch (error) {
          console.error("Error parsing saved locations:", error);
        }
      }
    } else {
      setUserAddress("");
      setSavedLocations([]);
    }
  }, [isSignedIn, user, setUserAddress]);

  useEffect(() => {
    if (userAddress && user) {
      const locationsKey = getSavedLocationsKey();
      const storageKey = getUserStorageKey();

      const existingLocation = localStorage.getItem(storageKey);
      let existingLocationData = null;
      if (existingLocation) {
        try {
          existingLocationData = JSON.parse(existingLocation);
        } catch (e) {
          console.error("Error parsing existing location:", e);
        }
      }

      const storedLocations = localStorage.getItem(locationsKey);
      const currentLocations = storedLocations
        ? JSON.parse(storedLocations)
        : [];

      const locationExists = currentLocations.some(
        (loc) => loc.address === userAddress
      );

      if (!locationExists && userAddress) {
        const locationData = {
          address: userAddress,
          timestamp: new Date().toISOString(),
          ...(existingLocationData?.coordinates && {
            coordinates: existingLocationData.coordinates,
          }),
        };

        localStorage.setItem(storageKey, JSON.stringify(locationData));

        const updatedLocations = [...currentLocations, locationData];
        setSavedLocations(updatedLocations);
        localStorage.setItem(locationsKey, JSON.stringify(updatedLocations));
      } else if (locationExists && existingLocationData?.coordinates) {
        const locationData = {
          address: userAddress,
          timestamp: existingLocationData.timestamp || new Date().toISOString(),
          coordinates: existingLocationData.coordinates,
        };
        localStorage.setItem(storageKey, JSON.stringify(locationData));
      }
    }
  }, [userAddress, user]);

  const removeLocation = (addressToRemove) => {
    const updatedLocations = savedLocations.filter(
      (loc) => loc.address !== addressToRemove
    );
    setSavedLocations(updatedLocations);
    localStorage.setItem(
      getSavedLocationsKey(),
      JSON.stringify(updatedLocations)
    );

    if (userAddress === addressToRemove) {
      if (updatedLocations.length > 0) {
        const newLocation = updatedLocations[0];
        setUserAddress(newLocation.address);
        localStorage.setItem(
          getUserStorageKey(),
          JSON.stringify(newLocation)
        );
        // Dispatch custom event to notify other components of location change
        window.dispatchEvent(new CustomEvent("locationChanged", { detail: newLocation }));
      } else {
        setUserAddress("");
        localStorage.removeItem(getUserStorageKey());
        // Dispatch event with null to indicate location cleared
        window.dispatchEvent(new CustomEvent("locationChanged", { detail: null }));
        setShowLocationPopup(true);
      }
    }
  };

  const setAsCurrentLocation = (location) => {
    setUserAddress(location.address);
    localStorage.setItem(getUserStorageKey(), JSON.stringify(location));
    // Dispatch custom event to notify other components of location change
    window.dispatchEvent(new CustomEvent("locationChanged", { detail: location }));
    setShowLocationDropdown(false);
  };

  const clearLocation = () => {
    if (user) {
      const storageKey = getUserStorageKey();
      localStorage.removeItem(storageKey);
      setUserAddress("");
      // Dispatch event with null to indicate location cleared
      window.dispatchEvent(new CustomEvent("locationChanged", { detail: null }));
      setShowLocationPopup(true);
      setShowLocationDropdown(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    const parts = address.split(",").map((p) => p.trim());
    return `${parts[0]}, ${parts[1] || parts[2] || ""}`.trim();
  };

  if (!isSignedIn) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
        className="flex items-center gap-1 md:gap-2 hover:text-[#1A1A1A] transition-colors px-2 md:px-3 py-1 rounded-lg hover:bg-[#e6c801]"
      >
        <i className="fa-solid fa-location-dot"></i>
        {userAddress ? (
          <span className="hidden md:inline max-w-[200px] truncate">
            {formatAddress(userAddress)}
          </span>
        ) : (
          <span className="hidden md:inline">Select Location</span>
        )}
        <i
          className={`fa-solid fa-chevron-down transition-transform duration-200 ${
            showLocationDropdown ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {showLocationDropdown && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-[#1A1A1A] rounded-lg shadow-2xl border border-[#FFDE01] overflow-hidden z-[1000] max-md:fixed max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-5/6 max-md:-translate-y-1/2 max-md:w-[90vw]">
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setShowLocationPopup(true);
                  setShowLocationDropdown(false);
                }}
                className="flex-1 bg-[#FFDE01] text-black font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#e6c801] transition-colors"
              >
                <i className="fa-solid fa-plus"></i>
                Add Location
              </button>
              {userAddress && (
                <button
                  onClick={clearLocation}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                  title="Clear current location"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedLocations.map((location, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg group transition-all ${
                    userAddress === location.address
                      ? "bg-[#FFDE01] text-black"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <button
                    onClick={() => setAsCurrentLocation(location)}
                    className="flex-1 text-left text-sm truncate"
                  >
                    {formatAddress(location.address)}
                    {userAddress === location.address && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-1 rounded">
                        Current
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => removeLocation(location.address)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      userAddress === location.address
                        ? "text-gray-700"
                        : "text-red-400"
                    }`}
                    title="Remove location"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              ))}
              {savedLocations.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  No saved locations yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
