import React, { useState, useEffect, useContext } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { GarageContext } from "../Contexts/GarageContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { carApiService, setAuthToken } from "../utils/apiService";

const Reservation = ({ open, handleClose, id }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#1A1A1A",
    border: "2px solid #FFED01",
    boxShadow: 24,
    p: 4,
    borderRadius: 3,
    color: "#FFED01",
  };

  const { services } = useContext(GarageContext);
  const { getToken, userId } = useAuth();

  const [userCars, setUserCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [garageServices, setGarageServices] = useState([]);
  const [garageDetails, setGarageDetails] = useState(null);
  const [loadingGarage, setLoadingGarage] = useState(false);
  const [formData, setFormData] = useState({
    service: "",
    car: "",
    tel: "",
    description: "",
    reservationDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (open && id) {
        setLoadingCars(true);
        setLoadingGarage(true);
        try {
          const token = await getToken();
          setAuthToken(token);
          
          // Fetch user cars
          const cars = await carApiService.getUserVehicles();
          setUserCars(cars || []);

          const defaultCar = cars?.find((car) => car.isDefault);
          if (defaultCar) {
            setFormData((prev) => ({
              ...prev,
              car: defaultCar._id,
            }));
          } else if (cars?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              car: cars[0]._id,
            }));
          }

          // Fetch garage data to get garage-specific services
          const garageResponse = await axios.get(
            `${backendUrl}/api/garage/${id}`
          );
          if (garageResponse.data.success && garageResponse.data.gar) {
            setGarageServices(garageResponse.data.gar.services || []);
            setGarageDetails(garageResponse.data.gar);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
          toast.error("Failed to load data");
          setUserCars([]);
          setGarageServices([]);
          setGarageDetails(null);
        } finally {
          setLoadingCars(false);
          setLoadingGarage(false);
        }
      }
    };

    fetchData();
  }, [open, id, getToken, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isWithinGarageHours = (dateValue) => {
    if (!dateValue || !garageDetails?.openingHours) return true;
    const openHour = Number(garageDetails.openingHours.open);
    const closeHour = Number(garageDetails.openingHours.close);

    if (
      Number.isInteger(openHour) &&
      Number.isInteger(closeHour) &&
      openHour < closeHour
    ) {
      const hourFraction =
        dateValue.getHours() + dateValue.getMinutes() / 60;
      return hourFraction >= openHour && hourFraction < closeHour;
    }
    return true;
  };

  const getMinReservationDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = await getToken();

    if (!token) {
      toast.error("Authentication required. Please sign in.");
      return;
    }

    if (formData.tel.length !== 8) {
      toast.error("Phone number must be exactly 8 digits!");
      return;
    }

    if (formData.description.length > 265) {
      toast.error("Description cannot exceed 265 characters!");
      return;
    }

    if (!formData.service) {
      toast.error("Please select a service!");
      return;
    }

    if (!formData.car) {
      toast.error("Please select a car!");
      return;
    }

    if (!formData.reservationDate) {
      toast.error("Please select a reservation date and time!");
      return;
    }

    const selectedDate = new Date(formData.reservationDate);
    if (isNaN(selectedDate.getTime())) {
      toast.error("Selected reservation date is invalid!");
      return;
    }

    if (!isWithinGarageHours(selectedDate)) {
      const openingHours = garageDetails?.openingHours;
      const openDisplay =
        typeof openingHours?.open === "number" ? openingHours.open : "?";
      const closeDisplay =
        typeof openingHours?.close === "number" ? openingHours.close : "?";
      toast.error(
        `Please pick a time between ${openDisplay}:00 and ${closeDisplay}:00`
      );
      return;
    }

    try {
      console.log("Submitting reservation with:", { carId: formData.car });
      const response = await axios.post(
        `${backendUrl}/api/Reservation/createReservation`,
        {
          carId: formData.car,
          serviceId: formData.service,
          garageId: id,
          reservationDate: selectedDate,
          tel: formData.tel,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Reservation created successfully!");
        // Reset form
        setFormData({
          service: "",
          car: "",
          tel: "",
          description: "",
          reservationDate: "",
        });
        handleClose();
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create reservation");
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        service: "",
        car: "",
        tel: "",
        description: "",
        reservationDate: "",
      });
      setGarageServices([]);
      setGarageDetails(null);
    }
  }, [open]);

  const getCarDisplayText = (car) => {
    const mainInfo = `${car.year} ${car.brand} ${car.model}`;
    const plateInfo = car.plate ? ` • ${car.plate}` : "";
    const defaultIndicator = car.isDefault ? " (Default)" : "";

    return `${mainInfo}${plateInfo}${defaultIndicator}`;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography
          variant="h6"
          sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
        >
          Service Reservation
        </Typography>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          {/* Service Select - Only garage-specific services */}
          <TextField
            select
            label="Service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={loadingGarage}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    overflow: "auto",
                  },
                },
              },
            }}
            sx={{
              input: { color: "#FFFFFF" },
              label: { color: "#FFED01" },
              fieldset: { borderColor: "#1B252F" },
              "& .MuiSelect-select": { color: "#FFFFFF" },
            }}
          >
            {loadingGarage ? (
              <MenuItem value="" sx={{ color: "#1A1A1A" }}>
                Loading services...
              </MenuItem>
            ) : garageServices.length > 0 ? (
              garageServices.map((service) => (
                <MenuItem
                  key={service._id}
                  value={service._id}
                  sx={{ color: "#1A1A1A" }}
                >
                  {service.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" sx={{ color: "#1A1A1A" }}>
                No services available
              </MenuItem>
            )}
          </TextField>

          {/* Car Select - Modern clean design */}
          <TextField
            select
            label="Vehicle"
            name="car"
            value={formData.car}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={loadingCars}
            sx={{
              input: { color: "#FFFFFF" },
              label: { color: "#FFED01" },
              fieldset: { borderColor: "#1B252F" },
              "& .MuiSelect-select": { color: "#FFFFFF" },
            }}
          >
            {loadingCars ? (
              <MenuItem value="" sx={{ color: "#1A1A1A" }}>
                Loading vehicles...
              </MenuItem>
            ) : userCars.length > 0 ? (
              userCars.map((car) => (
                <MenuItem
                  key={car._id}
                  value={car._id}
                  sx={{
                    color: "#1A1A1A",
                    borderLeft: car.isDefault ? "3px solid #FFED01" : "none",
                    backgroundColor: car.isDefault ? "#FFF9C4" : "transparent",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: car.isDefault ? "600" : "400" }}>
                      {car.year} {car.brand} {car.model}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      {car.plate && `Plate: ${car.plate}`}
                      {car.mileage && ` • ${car.mileage}km`}
                    </div>
                  </div>
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" sx={{ color: "#1A1A1A" }}>
                No vehicles available
              </MenuItem>
            )}
          </TextField>

          {/* Phone Number */}
          <TextField
            label="Phone Number"
            name="tel"
            type="text"
            value={formData.tel}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            sx={{
              input: { color: "#FFFFFF" },
              label: { color: "#FFED01" },
              fieldset: { borderColor: "#1B252F" },
            }}
          />

          {/* Description TextArea */}
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            sx={{
              textarea: { color: "#FFFFFF" },
              label: { color: "#FFED01" },
              fieldset: { borderColor: "#1B252F" },
            }}
            helperText={
              <span style={{ color: "#FFFFFF" }}>
                {formData.description.length}/265
              </span>
            }
          />

          <TextField
            label="Reservation time"
            name="reservationDate"
            type="datetime-local"
            value={formData.reservationDate}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getMinReservationDate(),
            }}
            sx={{
              input: { color: "#FFFFFF" },
              label: { color: "#FFED01" },
              fieldset: { borderColor: "#1B252F" },
            }}
            helperText={
              garageDetails?.openingHours
                ? `Garage hours: ${garageDetails.openingHours.open}:00 - ${garageDetails.openingHours.close}:00`
                : ""
            }
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={loadingCars || userCars.length === 0}
            sx={{
              mt: 2,
              bgcolor: "#FFED01",
              color: "#1A1A1A",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#E6DA00" },
              "&:disabled": { bgcolor: "#666666", color: "#999999" },
            }}
          >
            {loadingCars ? "Loading Vehicles..." : "Reserve Now"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default Reservation;
