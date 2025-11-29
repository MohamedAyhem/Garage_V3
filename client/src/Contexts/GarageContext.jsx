import React, { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

export const GarageContext = createContext();

export const GarageProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState(() => {
    // Load from localStorage on initial render
    return localStorage.getItem("selectedGarageId") || null;
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Update localStorage whenever selectedGarageId changes
  const handleSelectGarage = (garageId) => {
    setSelectedGarageId(garageId);
    localStorage.setItem("selectedGarageId", garageId);
  };

  // Clear selected garage from localStorage
  const handleClearSelectedGarage = () => {
    setSelectedGarageId(null);
    localStorage.removeItem("selectedGarageId");
  };

  const getServicesData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/service/services`);
      if (response.data.success) {
        setServices(response.data.services);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getServicesData();
  }, []);

  const value = {
    open,
    handleOpen,
    handleClose,
    services,
    selectedGarageId,
    handleSelectGarage,
    handleClearSelectedGarage,
  };
  return (
    <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
  );
};
