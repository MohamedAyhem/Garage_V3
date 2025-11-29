import garageModel from "../models/garage.js";
import serviceModel from "../models/service.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const creatGarage = async (req, res) => {
  try {
    const { location, name, description, capacity, serviceIds } = req.body;
    const clerkUserId = req.user?.id; // Clerk user ID from middleware

    const normalizedName = name?.trim();

    const coordinates = {
      latitude: req.body["coordinates[latitude]"]
        ? parseFloat(req.body["coordinates[latitude]"])
        : req.body.coordinates?.latitude
        ? parseFloat(req.body.coordinates.latitude)
        : null,
      longitude: req.body["coordinates[longitude]"]
        ? parseFloat(req.body["coordinates[longitude]"])
        : req.body.coordinates?.longitude
        ? parseFloat(req.body.coordinates.longitude)
        : null,
    };

    const openingHours = {
      open: req.body["openingHours[open]"] || req.body.openingHours?.open,
      close: req.body["openingHours[close]"] || req.body.openingHours?.close,
    };

    console.log("Received data:", {
      location,
      name: normalizedName,
      description,
      capacity,
      openingHours,
      serviceIds,
      clerkUserId,
    });

    if (
      !clerkUserId ||
      !location ||
      !normalizedName ||
      !description ||
      !capacity ||
      openingHours.open == null ||
      openingHours.close == null
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
        received: {
          hasLocation: !!location,
          hasName: !!normalizedName,
          hasDescription: !!description,
          hasCapacity: !!capacity,
          openingHours,
        },
      });
    }

    const capacityNum = Number(capacity);
    if (
      isNaN(capacityNum) ||
      capacityNum <= 0 ||
      !Number.isInteger(capacityNum)
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    const openNum = Number(openingHours.open);
    const closeNum = Number(openingHours.close);
    if (
      isNaN(openNum) ||
      openNum < 0 ||
      openNum > 23 ||
      !Number.isInteger(openNum)
    ) {
      return res.status(400).json({
        success: false,
        message: "Opening hour must be an integer between 0 and 23",
      });
    }
    if (
      isNaN(closeNum) ||
      closeNum < 0 ||
      closeNum > 23 ||
      !Number.isInteger(closeNum)
    ) {
      return res.status(400).json({
        success: false,
        message: "Closing hour must be an integer between 0 and 23",
      });
    }
    if (openNum >= closeNum) {
      return res.status(400).json({
        success: false,
        message: "Closing hour must be after opening hour",
      });
    }

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

    const duplicateGarage = await garageModel
      .findOne({ name: normalizedName })
      .collation({ locale: "en", strength: 2 });

    if (duplicateGarage) {
      return res.status(409).json({
        success: false,
        message: "A garage with this name already exists",
      });
    }

    const now = new Date().getHours();
    const isActive =
      now >= Number(openingHours.open) && now < Number(openingHours.close);

    const newGarage = new garageModel({
      location,
      name: normalizedName,
      capacity: capacityNum,
      description,
      coordinates:
        coordinates.latitude && coordinates.longitude
          ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
          : undefined,
      openingHours: {
        open: Number(openingHours.open),
        close: Number(openingHours.close),
      },
      Ownedby: clerkUserId, // Store Clerk user ID
      isActive,
      isVerified: false,
      photos: imagesUrl,
      services: validServiceIds,
    });

    console.log("Attempting to save garage:", {
      name: newGarage.name,
      location: newGarage.location,
      capacity: newGarage.capacity,
      servicesCount: newGarage.services.length,
      photosCount: newGarage.photos.length,
    });

    const savedGarage = await newGarage.save();
    console.log("Garage saved successfully with ID:", savedGarage._id);

    await serviceModel.updateMany(
      { _id: { $in: validServiceIds } },
      { $addToSet: { garages: savedGarage._id } }
    );

    res.status(201).json({
      success: true,
      message: "Garage added successfully",
      garageId: savedGarage._id,
    });
  } catch (error) {
    console.error("Error creating garage:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A garage with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack,
    });
  }
};

const getAllGarages = async (req, res) => {
  try {
    const clerkUserId = req.user?.id;

    const garages = await garageModel
      .find({ Ownedby: clerkUserId })
      .populate("services", "name image description");
    res.status(200).json({ success: true, garages: garages });
  } catch (error) {
    console.error("Error fetching garages list:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGarage = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, name, description, capacity, serviceIds } = req.body;
    const clerkUserId = req.user?.id;

    const coordinates = {
      latitude: req.body["coordinates[latitude]"]
        ? parseFloat(req.body["coordinates[latitude]"])
        : req.body.coordinates?.latitude
        ? parseFloat(req.body.coordinates.latitude)
        : null,
      longitude: req.body["coordinates[longitude]"]
        ? parseFloat(req.body["coordinates[longitude]"])
        : req.body.coordinates?.longitude
        ? parseFloat(req.body.coordinates.longitude)
        : null,
    };

    const existingGarage = await garageModel.findOne({
      _id: id,
      Ownedby: clerkUserId,
    });

    if (!existingGarage) {
      return res.status(404).json({
        success: false,
        message: "Garage not found or you don't have permission to update it",
      });
    }

    const openingHours = {
      open:
        req.body["openingHours[open]"] ||
        req.body.openingHours?.open ||
        existingGarage.openingHours?.open,
      close:
        req.body["openingHours[close]"] ||
        req.body.openingHours?.close ||
        existingGarage.openingHours?.close,
    };

    let capacityNum = existingGarage.capacity;
    if (capacity) {
      capacityNum = Number(capacity);
      if (
        isNaN(capacityNum) ||
        capacityNum <= 0 ||
        !Number.isInteger(capacityNum)
      ) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be a positive integer",
        });
      }
    }

    const openNum = Number(openingHours.open);
    const closeNum = Number(openingHours.close);
    if (
      isNaN(openNum) ||
      openNum < 0 ||
      openNum > 23 ||
      !Number.isInteger(openNum)
    ) {
      return res.status(400).json({
        success: false,
        message: "Opening hour must be an integer between 0 and 23",
      });
    }
    if (
      isNaN(closeNum) ||
      closeNum < 0 ||
      closeNum > 23 ||
      !Number.isInteger(closeNum)
    ) {
      return res.status(400).json({
        success: false,
        message: "Closing hour must be an integer between 0 and 23",
      });
    }
    if (openNum >= closeNum) {
      return res.status(400).json({
        success: false,
        message: "Closing hour must be after opening hour",
      });
    }

    let normalizedName = existingGarage.name;
    if (name) {
      normalizedName = name.trim();
      if (!normalizedName) {
        return res.status(400).json({
          success: false,
          message: "Garage name cannot be empty",
        });
      }

      const duplicateGarage = await garageModel
        .findOne({
          name: normalizedName,
          _id: { $ne: existingGarage._id },
        })
        .collation({ locale: "en", strength: 2 });

      if (duplicateGarage) {
        return res.status(409).json({
          success: false,
          message: "A garage with this name already exists",
        });
      }
    }

    let validServiceIds = existingGarage.services;
    if (serviceIds) {
      let serviceIdsArray = [];
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

      if (serviceIdsArray.length > 0) {
        validServiceIds = serviceIdsArray
          .map((sid) => {
            if (mongoose.Types.ObjectId.isValid(sid)) {
              return new mongoose.Types.ObjectId(sid);
            }
            return null;
          })
          .filter((sid) => sid !== null);

        const existingServices = await serviceModel.find({
          _id: { $in: validServiceIds },
        });

        if (existingServices.length !== validServiceIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more services not found",
          });
        }
      }
    }

    let imagesUrl = existingGarage.photos || [];
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const newImages = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    if (newImages.length > 0) {
      const newImagesUrl = await Promise.all(
        newImages.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
      imagesUrl = newImagesUrl;
    }

    const now = new Date().getHours();
    const isActive =
      now >= Number(openingHours.open) && now < Number(openingHours.close);

    const updateData = {
      ...(normalizedName && { name: normalizedName }),
      ...(location && { location }),
      ...(description && { description }),
      ...(capacity && { capacity: capacityNum }),
      ...(coordinates.latitude &&
        coordinates.longitude && {
          coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
        }),
      openingHours: {
        open: Number(openingHours.open),
        close: Number(openingHours.close),
      },
      isActive,
      photos: imagesUrl,
      services: validServiceIds,
    };

    const updatedGarage = await garageModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("services", "name image description");

    await serviceModel.updateMany(
      { _id: { $in: validServiceIds } },
      { $addToSet: { garages: id } }
    );

    res.status(200).json({
      success: true,
      message: "Garage updated successfully",
      garage: updatedGarage,
    });
  } catch (error) {
    console.error("Error updating garage:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A garage with this name already exists",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGarage = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkUserId = req.user?.id;

    const garage = await garageModel.findOne({
      _id: id,
      Ownedby: clerkUserId,
    });

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: "Garage not found or you don't have permission to delete it",
      });
    }

    // Delete associated mechanics (optional - you might want to keep them)
    // await mechanicModel.deleteMany({ garageId: id });

    await garageModel.findByIdAndDelete(id);

    await serviceModel.updateMany({ garages: id }, { $pull: { garages: id } });

    res.status(200).json({
      success: true,
      message: "Garage deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting garage:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { creatGarage, getAllGarages, updateGarage, deleteGarage };
