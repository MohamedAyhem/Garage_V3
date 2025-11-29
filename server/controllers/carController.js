import mongoose from "mongoose";
import Car from "../models/car.js";
import { carApiService } from "../services/carApiService.js";

const getCarBrands = async (req, res) => {
  try {
    const brands = await carApiService.getBrands();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.response?.data,
    });
  }
};

const getModelsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const models = await carApiService.getModelsByBrand(brandId);
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getYearsForModel = async (req, res) => {
  try {
    const { modelId } = req.params;
    const years = await carApiService.getYearsForModel(modelId);
    res.json({ success: true, data: years });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyVIN = async (req, res) => {
  try {
    const { vin } = req.params;
    if (!vin || vin.length < 17) {
      return res.status(400).json({
        success: false,
        message: "VIN must be at least 17 characters long",
      });
    }

    const vinData = await carApiService.verifyVIN(vin);
    res.json({ success: true, data: vinData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.response?.data,
    });
  }
};

const lookupLicensePlate = async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const { country = "US", region = null } = req.query;

    if (!licensePlate) {
      return res.status(400).json({
        success: false,
        message: "License plate is required",
      });
    }

    const plateData = await carApiService.lookupLicensePlate(
      licensePlate,
      country,
      region
    );
    res.json({ success: true, data: plateData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.response?.data,
    });
  }
};
const checkVINExists = async (req, res) => {
  try {
    const { vin } = req.params;

    if (!vin) {
      return res.status(400).json({
        success: false,
        message: "VIN is required",
      });
    }

    const existingCar = await Car.findOne({ vin });

    return res.status(200).json({
      success: true,
      exists: !!existingCar,
      car: existingCar || null,
    });
  } catch (error) {
    console.error("Error checking VIN:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking VIN",
      error: error.message,
    });
  }
};
const addCar = async (req, res) => {
  try {
    const { brand, model, plate, year, mileage, vin, make_id, model_id } =
      req.body;
    const userId = req.user?.id;

    console.log("Adding car - userId:", userId, "user:", req.user);
    console.log("Request body:", { brand, model, plate, year });

    if (!brand || !model || !plate || !year) {
      return res.status(400).json({
        success: false,
        message: "Brand, model, plate, and year are required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    const existingPlate = await Car.findOne({ plate });
    if (existingPlate) {
      return res.status(400).json({
        success: false,
        message: "A car with this plate number already exists",
      });
    }

    if (vin) {
      const existingVIN = await Car.findOne({ vin });
      if (existingVIN) {
        return res.status(400).json({
          success: false,
          message: "A car with this VIN already exists",
        });
      }
    }

    const userCarsCount = userId ? await Car.countDocuments({ userId }) : 0;
    const isDefault = userCarsCount === 0;

    const newCar = new Car({
      brand,
      model,
      plate,
      year: parseInt(year),
      mileage: mileage ? parseInt(mileage) : 0,
      vin: vin || null,
      make_id: make_id || null,
      model_id: model_id || null,
      userId,
      isDefault,
    });

    await newCar.save();

    return res.status(201).json({
      success: true,
      message: "Car added successfully",
      car: newCar,
    });
  } catch (error) {
    console.error("Error adding car:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message =
        field === "vin"
          ? "A car with this VIN already exists"
          : "A car with this plate number already exists";

      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    return res.status(200).json({ success: true, car });
  } catch (error) {
    console.error("Error fetching car:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching car",
      error: error.message,
    });
  }
};

const getUserCars = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const cars = await Car.find({ userId });
    return res.status(200).json({ success: true, cars });
  } catch (error) {
    console.error("Error fetching user cars:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user cars",
      error: error.message,
    });
  }
};

const setDefaultCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    await Car.updateMany({ userId }, { $set: { isDefault: false } });

    const car = await Car.findOneAndUpdate(
      { _id: carId, userId },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found or unauthorized",
      });
    }

    return res.status(200).json({ success: true, car });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error setting default car",
      error: error.message,
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findOneAndDelete({ _id: id, userId });
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting vehicle",
      error: error.message,
    });
  }
};

export {
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
};
