import serviceModel from "../models/service.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const createService = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    // Check if service with same name already exists
    const existingService = await serviceModel.findOne({ name: name.trim() });
    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "Service with this name already exists",
      });
    }

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one service image is required",
      });
    }

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const newService = new serviceModel({
      name: name.trim(),
      description,
      status: status || "waiting",
      image: imagesUrl,
      garages: [],
    });
    await newService.save();
    res.json({
      success: true,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const allServices = async (req, res) => {
  try {
    const services = await serviceModel
      .find()
      .populate("garages", "name image location");
    res.json({ success: true, services });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceModel.findById(id);
    if (service) {
      res.json({ success: true, service });
    } else {
      res.json({ success: false, message: "service not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { createService, allServices, getServiceById };
