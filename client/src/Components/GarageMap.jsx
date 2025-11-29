import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { calculateDistance } from "../utils/haversine";

const GarageMap = ({ latitude, longitude, garageName, location }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const garageMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const { user } = useUser();
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const getUserLocation = () => {
      if (user) {
        const storageKey = `userLocation_${user.id}`;
        const storedLocation = localStorage.getItem(storageKey);
        if (storedLocation) {
          try {
            const locationData = JSON.parse(storedLocation);
            if (
              locationData.coordinates?.latitude &&
              locationData.coordinates?.longitude
            ) {
              setUserLocation({
                latitude: locationData.coordinates.latitude,
                longitude: locationData.coordinates.longitude,
              });
              return;
            }
          } catch (error) {
            console.error("Error parsing stored location:", error);
          }
        }
      }

      const genericLocation = localStorage.getItem("userLocation");
      if (genericLocation) {
        try {
          const locationData = JSON.parse(genericLocation);
          if (
            locationData.coordinates?.latitude &&
            locationData.coordinates?.longitude
          ) {
            setUserLocation({
              latitude: locationData.coordinates.latitude,
              longitude: locationData.coordinates.longitude,
            });
            return;
          }
        } catch (error) {
          console.error("Error parsing generic location:", error);
        }
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {}
        );
      }
    };

    getUserLocation();

    const handleLocationChange = (event) => {
      const locationData = event.detail;
      if (
        locationData &&
        locationData.coordinates?.latitude &&
        locationData.coordinates?.longitude
      ) {
        setUserLocation({
          latitude: locationData.coordinates.latitude,
          longitude: locationData.coordinates.longitude,
        });
      } else {
        setUserLocation(null);
      }
    };

    window.addEventListener("locationChanged", handleLocationChange);
    return () => {
      window.removeEventListener("locationChanged", handleLocationChange);
    };
  }, [user]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current && latitude && longitude) {
      const garagePosition = [latitude, longitude];

      const map = L.map(mapRef.current).setView(garagePosition, 18);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const garageIcon = L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconRetinaUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const garageMarker = L.marker(garagePosition, { icon: garageIcon }).addTo(
        map
      );
      const garagePopupContent = `
        <div style="text-align: center; padding: 4px;">
          <strong style="font-size: 16px; color: #dc2626;">${garageName}</strong>
          ${
            location
              ? `<p style="font-size: 12px; color: #666; margin-top: 4px;">${location}</p>`
              : ""
          }
        </div>
      `;
      garageMarker.bindPopup(garagePopupContent);
      garageMarkerRef.current = garageMarker;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        garageMarkerRef.current = null;
        userMarkerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, [latitude, longitude, garageName, location]);

  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    const garagePosition = [latitude, longitude];
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (userLocation?.latitude && userLocation?.longitude) {
      const userPosition = [userLocation.latitude, userLocation.longitude];

      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      );
      setDistance(dist);

      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="
            background-color: #3b82f6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      });

      const userMarker = L.marker(userPosition, { icon: userIcon }).addTo(map);
      const userPopupContent = `
        <div style="text-align: center; padding: 4px;">
          <strong style="font-size: 16px; color: #3b82f6;">Your Location</strong>
        </div>
      `;
      userMarker.bindPopup(userPopupContent);
      userMarkerRef.current = userMarker;

      const getRoute = async () => {
        try {
          const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${longitude},${latitude}?overview=full&geometries=geojson`;

          const response = await fetch(osrmUrl);
          const data = await response.json();

          if (data.code === "Ok" && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routeGeometry = route.geometry.coordinates;

            const routeCoordinates = routeGeometry.map((coord) => [
              coord[1],
              coord[0],
            ]);

            const routePolyline = L.polyline(routeCoordinates, {
              color: "#0000FF",
              weight: 12,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);
            polylineRef.current = routePolyline;

            const routeDistanceKm = route.distance / 1000;
            setDistance(routeDistanceKm);

            const routeBounds = L.latLngBounds(routeCoordinates);
            map.fitBounds(routeBounds, { padding: [50, 50], maxZoom: 18 });
          } else {
            const fallbackLine = L.polyline([userPosition, garagePosition], {
              color: "#0000FF",
              weight: 12,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);
            polylineRef.current = fallbackLine;

            setDistance(dist);

            const bounds = L.latLngBounds([userPosition, garagePosition]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
          }
        } catch (error) {
          console.error("Error fetching route:", error);
          const fallbackLine = L.polyline([userPosition, garagePosition], {
            color: "#FF0000",
            weight: 12,
            opacity: 1,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);
          polylineRef.current = fallbackLine;

          setDistance(dist);

          const bounds = L.latLngBounds([userPosition, garagePosition]);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        }
      };

      getRoute();
    } else {
      map.setView(garagePosition, 17);
      setDistance(null);
    }
  }, [userLocation, latitude, longitude]);

  if (!latitude || !longitude) {
    return (
      <div className="bg-black/30 border-2 border-[#FFDE01] p-8 rounded-lg text-center">
        <p className="text-white text-lg">
          <i className="fa-solid fa-map-location-dot mr-2 text-[#FFDE01]"></i>
          Location map not available
        </p>
        {location && <p className="text-gray-400 mt-2">{location}</p>}
      </div>
    );
  }

  // const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="space-y-4">
      {/* Map Legend */}
      {userLocation && (
        <div className="flex items-center justify-center gap-6 flex-wrap bg-black/30 border border-[#FFDE01] rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
            <span className="text-white text-sm">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md"></div>
            <span className="text-white text-sm">{garageName}</span>
          </div>
          {distance && (
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-route text-[#FFDE01]"></i>
              <span className="text-[#FFDE01] font-bold">
                {distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(1)}km`}{" "}
                away
              </span>
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-[500px] w-full rounded-lg overflow-hidden border-2 border-[#FFDE01] shadow-lg"
        style={{ zIndex: 0 }}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        {/* <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FFDE01] hover:bg-[#e6c801] text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <i className="fa-brands fa-google"></i>
          Open in Google Maps
        </a> */}
        {userLocation && (
          <a
            href={`https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <i className="fa-solid fa-directions"></i>
            Get Directions on Google Maps
          </a>
        )}
      </div>
    </div>
  );
};

export default GarageMap;
