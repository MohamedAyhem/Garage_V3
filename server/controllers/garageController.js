import garageModel from "../models/garage.js";
import serviceModel from "../models/service.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { findGaragesWithinRadius, calculateDistance } from "../utils/haversine.js";
const createGarage = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      capacity,
      openingHours,
      isActive,
      isVerified,
      serviceIds,
    } = req.body;

    let serviceIdsArray = [];
    if (serviceIds) {
      try {
        serviceIdsArray =
          typeof serviceIds === "string"
            ? JSON.parse(serviceIds)
            : Array.isArray(serviceIds)
            ? serviceIds
            : [];
      } catch (e) {
        serviceIdsArray = Array.isArray(serviceIds) ? serviceIds : [];
      }
    }

    if (!serviceIdsArray || serviceIdsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one service must be selected",
      });
    }

    const validServiceIds = serviceIdsArray
      .map((id) => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return null;
      })
      .filter((id) => id !== null);

    if (validServiceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid service IDs provided",
      });
    }

    const existingServices = await serviceModel.find({
      _id: { $in: validServiceIds },
    });

    if (existingServices.length !== validServiceIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more services not found",
      });
    }

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const garageInfo = {
      name,
      description,
      location,
      capacity,
      openingHours: Number(openingHours),
      photos: imagesUrl,
      isActive: isActive === "true" ? true : false,
      isVerified: isVerified === "true" ? true : false,
      services: validServiceIds,
    };
    console.log(garageInfo);
    const garage = new garageModel(garageInfo);
    await garage.save();

    await serviceModel.updateMany(
      { _id: { $in: validServiceIds } },
      { $addToSet: { garages: garage._id } }
    );

    res.json({ success: true, message: "Garage Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error);
  }
};

const garageList = async (req, res) => {
  try {
    const list = await garageModel
      .find()
      .populate("services", "name image description");
    res.json({ success: true, list });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getGarageByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { latitude, longitude } = req.query;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await serviceModel.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const garages = await garageModel
      .find({ services: serviceId })
      .populate("services", "name image description");

    // If user location is provided, calculate distance for each garage
    let garagesWithDistance = garages;
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      if (!isNaN(userLat) && !isNaN(userLon)) {
        garagesWithDistance = garages.map((garage) => {
          const garageObj = garage.toObject ? garage.toObject() : garage;
          
          // Calculate distance if garage has coordinates
          if (
            garageObj.coordinates?.latitude &&
            garageObj.coordinates?.longitude
          ) {
            const distance = calculateDistance(
              userLat,
              userLon,
              garageObj.coordinates.latitude,
              garageObj.coordinates.longitude
            );
            return {
              ...garageObj,
              distance: parseFloat(distance.toFixed(2)),
            };
          }
          return garageObj;
        });

        // Sort by distance (garages without coordinates go to the end)
        garagesWithDistance.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      }
    }

    res.json({ success: true, garages: garagesWithDistance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGarageById = async (req, res) => {
  try {
    const { id } = req.params;
    const gar = await garageModel
      .findById(id)
      .populate("services", "name image description");
    if (gar) {
      res.json({ success: true, gar });
    } else {
      res.json({ success: false, message: "garage not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getGaragesNearLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, serviceId } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusKm = parseFloat(radius) || 50;

    if (isNaN(lat) || isNaN(lon) || isNaN(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude, longitude, or radius values",
      });
    }

    let query = {};
    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
      query.services = new mongoose.Types.ObjectId(serviceId);
    }

    const allGarages = await garageModel
      .find(query)
      .populate("services", "name image description");

    const nearbyGarages = findGaragesWithinRadius(
      allGarages,
      lat,
      lon,
      radiusKm
    );

    res.json({
      success: true,
      garages: nearbyGarages,
      count: nearbyGarages.length,
      center: { latitude: lat, longitude: lon },
      radius: radiusKm,
    });
  } catch (error) {
    console.error("Error fetching garages near location:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createGarage,
  garageList,
  getGarageByServiceId,
  getGarageById,
  getGaragesNearLocation,
};
