import express from "express";
import {
  getCarBrands,
  getModelsByBrand,
  getYearsForModel,
  verifyVIN,
  lookupLicensePlate,
  checkVINExists,
  addCar,
  getCarById,
  getUserCars,
  setDefaultCar,
  deleteVehicle,
} from "../controllers/carController.js";
import { authenticateUser } from "../middleware/auth.js";

const carRoute = express.Router();

carRoute.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Car API route is working!",
    timestamp: new Date().toISOString(),
  });
});

carRoute.get("/brands", getCarBrands);
carRoute.get("/models/:brandId", getModelsByBrand);
carRoute.get("/years/:modelId", getYearsForModel);
carRoute.get("/vin/:vin", verifyVIN);
carRoute.get("/plate/:licensePlate", lookupLicensePlate);

carRoute.get("/user/cars", authenticateUser, getUserCars);
carRoute.get("/check-vin/:vin", authenticateUser, checkVINExists);
carRoute.post("/addCar", authenticateUser, addCar);
carRoute.put("/default/:carId", authenticateUser, setDefaultCar);
carRoute.get("/car/:id", authenticateUser, getCarById);
carRoute.delete("/:id", authenticateUser, deleteVehicle);

export default carRoute;
