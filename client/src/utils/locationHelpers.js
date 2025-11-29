export const getLocationStorageKey = (user) => {
  return user ? `userLocation_${user.id}` : "userLocation";
};

export const getSavedLocationsKey = (user) => {
  return user ? `savedLocations_${user.id}` : "savedLocations";
};

export const formatAddress = (address) => {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim());
  return `${parts[0]}, ${parts[1] || parts[2] || ""}`.trim();
};

export const fetchAddressFromCoords = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en&zoom=18`
    );

    if (!response.ok) throw new Error("Failed to fetch address");

    const data = await response.json();
    return {
      address: data.display_name,
      coordinates: { latitude, longitude },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
};

export const addNewLocationToStorage = (locationData, user) => {
  if (!user) return;

  const storageKey = getLocationStorageKey(user);
  const locationsKey = getSavedLocationsKey(user);

  localStorage.setItem(storageKey, JSON.stringify(locationData));

  const storedLocations = localStorage.getItem(locationsKey);
  const currentLocations = storedLocations ? JSON.parse(storedLocations) : [];

  const locationExists = currentLocations.some(
    (loc) => loc.address === locationData.address
  );

  if (!locationExists) {
    const updatedLocations = [...currentLocations, locationData];
    localStorage.setItem(locationsKey, JSON.stringify(updatedLocations));
  }
};
