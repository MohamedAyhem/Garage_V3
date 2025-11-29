/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lon1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lon2 - Longitude of the second point
 * @param {string} unit - Unit of distance ('km' for kilometers, 'mi' for miles, default: 'km')
 * @returns {number} Distance between the two points in the specified unit
 */
export const calculateDistance = (lat1, lon1, lat2, lon2, unit = "km") => {
  // Earth's radius in kilometers
  const R = unit === "mi" ? 3959 : 6371;

  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Find garages within a certain radius of a location
 * @param {Array} garages - Array of garage objects with coordinates
 * @param {number} centerLat - Latitude of the center point
 * @param {number} centerLon - Longitude of the center point
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array} Array of garages within the radius, sorted by distance
 */
export const findGaragesWithinRadius = (
  garages,
  centerLat,
  centerLon,
  radiusKm
) => {
  return garages
    .map((garage) => {
      if (!garage.coordinates?.latitude || !garage.coordinates?.longitude) {
        return null;
      }

      const distance = calculateDistance(
        centerLat,
        centerLon,
        garage.coordinates.latitude,
        garage.coordinates.longitude
      );

      if (distance <= radiusKm) {
        return {
          ...garage,
          distance: parseFloat(distance.toFixed(2)),
        };
      }

      return null;
    })
    .filter((garage) => garage !== null)
    .sort((a, b) => a.distance - b.distance);
};
