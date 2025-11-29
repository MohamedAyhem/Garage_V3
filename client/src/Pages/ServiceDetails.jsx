import React, { useContext, useState, useEffect } from "react";
import Footer from "../Components/Footer";
import GarageCard from "../Components/GarageCard";
import Garage_Pagination from "../Components/Garage_Pagination";
import Reservation from "../Components/Reservation";
import { GarageContext } from "../Contexts/GarageContext";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

const ServiceDetails = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedGarageId, setSelectedGarageId] = useState(null);
  const { id } = useParams();
  const { services } = useContext(GarageContext);
  const [serviceData, setServiceData] = useState(false);
  const [garages, setGarages] = useState([]);
  const [img, setImage] = useState("");
  const { open, handleOpen, handleClose } = useContext(GarageContext);
  const { user } = useUser();
  const [userLocation, setUserLocation] = useState(null);

  const fetchServiceData = () => {
    if (!services || services.length === 0) return;

    const item = services.find((service) => service._id === id);
    if (item) {
      setServiceData(item);
      setImage(item.image[0]);
    } else {
      console.log("No service found for ID:", id);
    }
  };

  useEffect(() => {
    console.log("test");

    if (!serviceData) return;

    const fetchGarages = async () => {
      try {
        let url = `${backendUrl}/api/garage/Garage/${serviceData._id}`;
        if (userLocation?.latitude && userLocation?.longitude) {
          url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
        }

        const response = await axios.get(url);
        if (response.data.success) {
          setGarages(response.data.garages);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };

    fetchGarages();
  }, [serviceData, userLocation]);

  useEffect(() => {
    fetchServiceData();
  }, [id, services]);

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
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
          },
          (error) => {
            console.error("Error getting location:", error);
            setUserLocation(null);
          }
        );
      } else {
        setUserLocation(null);
      }
    };

    getUserLocation();
  }, [user]);

  useEffect(() => {
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

    const handleStorageChange = (e) => {
      if (
        e.key &&
        (e.key.startsWith("userLocation") || e.key === "userLocation")
      ) {
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
            } else {
              setUserLocation(null);
            }
          } catch (error) {
            console.error("Error parsing generic location:", error);
            setUserLocation(null);
          }
        } else {
          setUserLocation(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("locationChanged", handleLocationChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  return (
    <div className="h-auto">
      <div className="bg-[#1A1A1A]  border-b-[25px] border-b-[#FFDE01]  text-white  w-[100%] py-50 ">
        <div className="relative sm:w-[100%] md:w-[90%]  mx-auto px-10">
          <div className="relative">
            {img ? (
              <img
                src={img}
                alt=""
                className="w-[100%] h-[300px] rounded-xl object-cover"
              />
            ) : null}
            <h1 className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-center py-3 rounded-b-xl text-lg sm:text-2xl">
              {serviceData.name}
            </h1>
          </div>
          <div className="mt-10">
            <p className="leading-6">{serviceData.description}</p>
          </div>
          <div>
            <h1 className="text-[#FFDE01] text-2xl mt-8 mb-3 font-bold">
              Find a Garage
            </h1>
            <hr />
            <ul className="w-[100%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 relative">
              {garages.map((item, index) => (
                <li key={index}>
                  <GarageCard
                    title={item.name}
                    fn1={() => {
                      setSelectedGarageId(item._id);
                      handleOpen();
                    }}
                    fn2={handleClose}
                    img={item.photos[0]}
                    id={item._id}
                    distance={item.distance}
                  />
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-5">
              <Garage_Pagination />
            </div>
          </div>
        </div>
      </div>
      <Reservation
        open={open}
        handleClose={handleClose}
        id={selectedGarageId}
      />
      {/* <Footer /> */}
    </div>
  );
};

export default ServiceDetails;
