import { useState } from "react";

const LocationPopup = ({ isOpen, onClose, onLocationSet }) => {
  const [loading, setLoading] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getLocation = () => {
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchAddress(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          alert(
            "Unable to get your location. Please check your browser permissions."
          );
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoading(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en&zoom=18`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();
      const address = data.display_name;

      if (onLocationSet) {
        onLocationSet({
          address: address,
          coordinates: {
            latitude: latitude,
            longitude: longitude,
          },
          timestamp: new Date().toISOString(),
        });
      }

      onClose();
    } catch (error) {
      console.error("Error fetching address:", error);
      alert("Error getting address details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="mt-10 bg-black/15 z-50 max-md:mt-20"
        onClick={handleOverlayClick}
      />
      <div className="fixed inset-0 flex backdrop-blur-[1px] items-center justify-center z-50">
        <div className="bg-[#1A1A1A] p-8 rounded-xl shadow-2xl max-w-md w-full border border-[#FFDE01] transform transition-all duration-300 ease-out relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div className="relative">
            <h2 className="text-2xl font-bold mb-2 text-[#FFDE01] tracking-wide pr-8">
              Add New Location
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              We need your location to find the nearest garages in your area
            </p>

            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <button
                  onClick={getLocation}
                  disabled={loading}
                  className="w-full bg-[#FFDE01] hover:bg-[#FFDE01]/90 text-black font-bold px-6 py-3 rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-black"
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
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-location-crosshairs"></i>
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationPopup;
