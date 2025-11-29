import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

const useMyGarages = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const { getToken } = useAuth();
  const itemsPerPage = 6;

  const [page, setPage] = useState(1);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGarage, setEditingGarage] = useState(null);
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [servicesPopupOpen, setServicesPopupOpen] = useState(null);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [open, setOpen] = useState("");
  const [close, setClose] = useState("");
  const [images, setImages] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");

  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceImages, setNewServiceImages] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest(".menu-container")) {
        setOpenMenuId(null);
      }
      if (
        serviceDropdownOpen &&
        !event.target.closest(".service-dropdown-container")
      ) {
        setServiceDropdownOpen(false);
      }
    };

    if (openMenuId || serviceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, serviceDropdownOpen]);

  const fetchGarages = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        console.error("No token available");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${backendUrl}/api/garage-owner/my-garages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGarages(res.data.garages || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching garages:", error);
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/service/services`);
      if (res.data.success) {
        setServices(res.data.services || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchGarages();
    fetchServices();
  }, []);

  const handleCreateService = async (e) => {
    e.preventDefault();

    if (!newServiceName || newServiceImages.length === 0) {
      toast.error("Service name and at least one image are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newServiceName);
      formData.append("description", newServiceDescription);

      newServiceImages.forEach((img, index) => {
        formData.append(`image${index + 1}`, img);
      });

      const res = await axios.post(
        `${backendUrl}/api/service/addService`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setSelectedServices([...selectedServices, res.data.service._id]);
        await fetchServices();
        setNewServiceName("");
        setNewServiceDescription("");
        setNewServiceImages([]);
        setShowServiceModal(false);
        toast.success("Service created successfully!");
      } else {
        toast.error(res.data.message || "Failed to create service");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error(
        "Failed to create service: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en&zoom=18`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch address");
            }

            const data = await response.json();
            const address = data.display_name;

            setLocation(address);
            setCoordinates({ latitude, longitude });
            setLocationLoading(false);
          } catch (error) {
            console.error("Error fetching address:", error);
            toast.error("Error getting address details. Please try again.");
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Unable to get your location. Please check your browser permissions."
          );
          setLocationLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLocationLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setCoordinates({ latitude: null, longitude: null });
    setDescription("");
    setCapacity("");
    setOpen("");
    setClose("");
    setImages([]);
    setSelectedServices([]);
    setEditingGarage(null);
    setServiceSearchTerm("");
    setServiceDropdownOpen(false);
  };

  const openEditModal = (garage) => {
    setEditingGarage(garage);
    setName(garage.name || "");
    setLocation(garage.location || "");
    setCoordinates(garage.coordinates || { latitude: null, longitude: null });
    setDescription(garage.description || "");
    setCapacity(garage.capacity?.toString() || "");
    setOpen(garage.openingHours?.open?.toString() || "");
    setClose(garage.openingHours?.close?.toString() || "");
    setSelectedServices(garage.services?.map((s) => s._id) || []);
    setImages([]);
    setEditModalOpen(true);
  };

  const handleCreateGarage = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const capacityNum = Number(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast.error("Capacity must be a positive number");
      return;
    }

    const openNum = Number(open);
    const closeNum = Number(close);
    if (isNaN(openNum) || openNum < 0 || openNum > 23) {
      toast.error("Opening hour must be between 0 and 23");
      return;
    }
    if (isNaN(closeNum) || closeNum < 0 || closeNum > 23) {
      toast.error("Closing hour must be between 0 and 23");
      return;
    }
    if (openNum >= closeNum) {
      toast.error("Closing hour must be after opening hour");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();

      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append("name", name);
      formData.append("location", location);
      if (coordinates.latitude && coordinates.longitude) {
        formData.append("coordinates[latitude]", coordinates.latitude);
        formData.append("coordinates[longitude]", coordinates.longitude);
      }
      formData.append("description", description);
      formData.append("capacity", capacity);
      formData.append("openingHours[open]", open);
      formData.append("openingHours[close]", close);
      formData.append("serviceIds", JSON.stringify(selectedServices));

      images.forEach((img, index) => {
        formData.append(`image${index + 1}`, img);
      });

      const res = await axios.post(
        `${backendUrl}/api/garage-owner/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setModalOpen(false);
        resetForm();
        fetchGarages();
        toast.success("Garage created successfully!");
      }
    } catch (error) {
      console.error("Error creating garage:", error);
      toast.error(
        "Failed to create garage: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGarage = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const capacityNum = Number(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast.error("Capacity must be a positive number");
      return;
    }

    const openNum = Number(open);
    const closeNum = Number(close);
    if (isNaN(openNum) || openNum < 0 || openNum > 23) {
      toast.error("Opening hour must be between 0 and 23");
      return;
    }
    if (isNaN(closeNum) || closeNum < 0 || closeNum > 23) {
      toast.error("Closing hour must be between 0 and 23");
      return;
    }
    if (openNum >= closeNum) {
      toast.error("Closing hour must be after opening hour");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();

      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append("name", name);
      formData.append("location", location);
      if (coordinates.latitude && coordinates.longitude) {
        formData.append("coordinates[latitude]", coordinates.latitude);
        formData.append("coordinates[longitude]", coordinates.longitude);
      }
      formData.append("description", description);
      formData.append("capacity", capacity);
      formData.append("openingHours[open]", open);
      formData.append("openingHours[close]", close);
      formData.append("serviceIds", JSON.stringify(selectedServices));

      if (images.length > 0) {
        images.forEach((img, index) => {
          formData.append(`image${index + 1}`, img);
        });
      }

      const res = await axios.put(
        `${backendUrl}/api/garage-owner/garage/${editingGarage._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setEditModalOpen(false);
        resetForm();
        fetchGarages();
        toast.success("Garage updated successfully!");
      }
    } catch (error) {
      console.error("Error updating garage:", error);
      toast.error(
        "Failed to update garage: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGarage = async (garageId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this garage? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      const res = await axios.delete(
        `${backendUrl}/api/garage-owner/garage/${garageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        fetchGarages();
        toast.success("Garage deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting garage:", error);
      toast.error(
        "Failed to delete garage: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const toggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const totalPages = Math.ceil(garages.length / itemsPerPage);
  const paginatedData = garages.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return {
    // state
    page,
    setPage,
    garages,
    loading,
    modalOpen,
    setModalOpen,
    editModalOpen,
    setEditModalOpen,
    editingGarage,
    services,
    showServiceModal,
    setShowServiceModal,
    openMenuId,
    setOpenMenuId,
    servicesPopupOpen,
    setServicesPopupOpen,
    serviceDropdownOpen,
    setServiceDropdownOpen,
    name,
    setName,
    location,
    setLocation,
    coordinates,
    setCoordinates,
    locationLoading,
    description,
    setDescription,
    capacity,
    setCapacity,
    open,
    setOpen,
    close,
    setClose,
    images,
    setImages,
    selectedServices,
    setSelectedServices,
    isSubmitting,
    serviceSearchTerm,
    setServiceSearchTerm,
    newServiceName,
    setNewServiceName,
    newServiceDescription,
    setNewServiceDescription,
    newServiceImages,
    setNewServiceImages,

    // handlers
    fetchGarages,
    fetchServices,
    handleCreateService,
    getCurrentLocation,
    resetForm,
    openEditModal,
    handleCreateGarage,
    handleUpdateGarage,
    handleDeleteGarage,
    toggleService,

    // derived
    totalPages,
    paginatedData,
  };
};

export default useMyGarages;
