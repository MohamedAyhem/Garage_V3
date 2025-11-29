import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GarageContext } from "../Contexts/GarageContext";
import { useContext } from "react";
import Reservation from "../Components/Reservation";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import Footer from "../Components/Footer";
import GarageMap from "../Components/GarageMap";

const Garage_Details = () => {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [garageData, setGarageData] = useState(null);

  const { open, handleOpen, handleClose } = useContext(GarageContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("test");

    const fetchGarageData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/garage/${id}`);
        if (response.data.success) {
          setGarageData(response.data.gar);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load garage details.");
      }
    };

    fetchGarageData();
  }, [id, backendUrl]);

  if (!garageData) {
    return (
      <div className="bg-[#1B252F] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-4xl font-bold mb-5">
            Service Not Found
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-[#FFDE01] py-3 px-8 text-black font-bold hover:bg-black hover:text-[#FFDE01] transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B252F] min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full">
        <img
          src={garageData?.photos?.[0] || "/garage1.jpg"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-5">
          <h1 className="text-white text-5xl lg:text-7xl font-bold italic text-center mt-25">
            {garageData.name}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-20">
        {/* Description */}
        <div className="mb-16">
          <h2 className="text-[#FFDE01] text-3xl font-bold mb-6">About</h2>
          <p className="text-white text-lg leading-relaxed">
            {garageData.description}
          </p>
        </div>

        {/* Location Map */}
        <div className="mb-16">
          <h2 className="text-[#FFDE01] text-3xl font-bold mb-6">Location</h2>
          <GarageMap
            latitude={garageData.coordinates?.latitude}
            longitude={garageData.coordinates?.longitude}
            garageName={garageData.name}
            location={garageData.location}
          />
        </div>

        {/* Services Offered */}
        {garageData.services && garageData.services.length > 0 && (
          <div className="mb-16">
            <h2 className="text-[#FFDE01] text-3xl font-bold mb-6">
              Services Offered
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {garageData.services.map((service) => (
                <div
                  key={service._id}
                  className="bg-black/30 border-2 border-[#FFDE01] p-4 rounded-lg"
                >
                  {service.image && service.image.length > 0 && (
                    <img
                      src={service.image[0]}
                      alt={service.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="text-[#FFDE01] text-xl font-bold mb-2">
                    {service.name}
                  </h3>
                  {/* {service.description && (
                    <p className="text-white text-sm">{service.description}</p>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery */}
        <div className="mb-16">
          <h2 className="text-[#FFDE01] text-3xl font-bold mb-6">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {garageData?.photos?.length > 0 ? (
              garageData.photos.map((item, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden group border-2 border-[#FFDE01] h-[300px]"
                >
                  <img
                    src={item}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))
            ) : (
              <p className="text-white">No photos available</p>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-black/30 border-2 border-[#FFDE01] p-10 text-center">
          <h2 className="text-white text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white text-lg mb-8">
            Book your appointment today and experience professional service
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button
              onClick={handleOpen}
              className="bg-[#FFDE01] py-4 px-8 text-black text-xl font-bold hover:bg-white transition-colors"
            >
              BOOK NOW <i className="fa-solid fa-calendar-check ml-3"></i>
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-transparent border-2 border-[#FFDE01] py-4 px-8 text-[#FFDE01] text-xl font-bold hover:bg-[#FFDE01] hover:text-black transition-colors"
            >
              BACK TO SERVICES <i className="fa-solid fa-arrow-left ml-3"></i>
            </button>
          </div>
        </div>
      </div>
      <Reservation open={open} handleClose={handleClose} id={id} />
      {/* <Footer /> */}
    </div>
  );
};

export default Garage_Details;
