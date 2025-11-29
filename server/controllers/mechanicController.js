import mechanicModel from "../models/mechanic.js";
import garageModel from "../models/garage.js";
import validator from "validator";
import mongoose from "mongoose";
import crypto from "crypto";
import {
  encryptPassword,
  decryptPassword,
} from "../utils/passwordEncryption.js";

const generatePassword = () => {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = crypto.randomBytes(length);
  return Array.from(randomBytes)
    .map((byte) => charset[byte % charset.length])
    .join("");
};

const createMechanic = async (req, res) => {
  try {
    const { name, email, salary, hours, garageId, password } = req.body;
    const clerkUserId = req.user?.id;
    const garages = await garageModel.find({ Ownedby: clerkUserId });

    if (!garages.length) {
      return res.status(403).json({
        success: false,
        message: "You must own at least one garage to create mechanics",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const existingMechanic = await mechanicModel.findOne({ email });
    if (existingMechanic) {
      return res.status(400).json({
        success: false,
        message: "A mechanic with this email already exists",
      });
    }

    // Determine which garage to assign
    let selectedGarageId = garageId;

    if (selectedGarageId) {
      // If garageId provided, verify ownership
      const garage = await garageModel.findOne({
        _id: selectedGarageId,
        Ownedby: clerkUserId,
      });
      if (!garage) {
        return res.status(403).json({
          success: false,
          message: "You don't own this garage or garage doesn't exist",
        });
      }
    } else {
      // If no garageId provided, use the first garage
      selectedGarageId = garages[0]._id;
    }

    const mechanicPassword = password || generatePassword();
    const encryptedPassword = encryptPassword(mechanicPassword);

    const newMechanic = new mechanicModel({
      name,
      email,
      password: encryptedPassword,
      salary: Number(salary),
      hours: Number(hours),
      ownedBy: clerkUserId,
      garageId: selectedGarageId,
    });

    const savedMechanic = await newMechanic.save();

    res.status(201).json({
      success: true,
      message: "Mechanic created successfully",
      mechanic: {
        _id: savedMechanic._id,
        name: savedMechanic.name,
        email: savedMechanic.email,
        password: mechanicPassword,
        salary: savedMechanic.salary,
        hours: savedMechanic.hours,
        ownedBy: savedMechanic.ownedBy,
        garageId: savedMechanic.garageId,
        createdAt: savedMechanic.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating mechanic:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllMechanics = async (req, res) => {
  try {
    const clerkUserId = req.user?.id;
    const { garageId } = req.query; // Get garageId from query params

    let query = { ownedBy: clerkUserId };

    // If garageId is provided, filter by that specific garage
    if (garageId) {
      query.garageId = garageId;
    }

    const mechanics = await mechanicModel
      .find(query)
      .populate("garageId", "name location")
      .sort({ createdAt: -1 });

    const mechanicsWithPassword = mechanics.map((mechanic) => {
      let decryptedPassword = null;
      try {
        if (mechanic.password) {
          decryptedPassword = decryptPassword(mechanic.password);
        }
      } catch (error) {
        console.error(
          `Error decrypting password for mechanic ${mechanic._id}:`,
          error
        );
      }

      const mechanicObj = mechanic.toObject();
      return {
        ...mechanicObj,
        password: decryptedPassword,
      };
    });

    res.status(200).json({
      success: true,
      mechanics: mechanicsWithPassword,
      count: mechanicsWithPassword.length,
    });
  } catch (error) {
    console.error("Error fetching mechanics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMechanicById = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkUserId = req.user?.id;

    const mechanic = await mechanicModel
      .findOne({ _id: id, ownedBy: clerkUserId })
      .populate("garageId", "name location")
      .select("-password");

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found or you don't have permission to view it",
      });
    }

    res.status(200).json({
      success: true,
      mechanic: mechanic,
    });
  } catch (error) {
    console.error("Error fetching mechanic:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMechanic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, salary, hours, garageId } = req.body;
    const clerkUserId = req.user?.id;

    const existingMechanic = await mechanicModel.findOne({
      _id: id,
      ownedBy: clerkUserId,
    });

    if (!existingMechanic) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found or you don't have permission to update it",
      });
    }

    if (email && email !== existingMechanic.email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email",
        });
      }

      const emailExists = await mechanicModel.findOne({
        email,
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "A mechanic with this email already exists",
        });
      }
    }

    if (garageId) {
      const garage = await garageModel.findOne({
        _id: garageId,
        Ownedby: clerkUserId,
      });
      if (!garage) {
        return res.status(403).json({
          success: false,
          message: "You don't own this garage or garage doesn't exist",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (salary !== undefined) updateData.salary = Number(salary);
    if (hours !== undefined) updateData.hours = Number(hours);
    if (garageId !== undefined) updateData.garageId = garageId || null;
    updateData.updatedAt = new Date();

    const updatedMechanic = await mechanicModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("garageId", "name location")
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Mechanic updated successfully",
      mechanic: updatedMechanic,
    });
  } catch (error) {
    console.error("Error updating mechanic:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMechanic = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkUserId = req.user?.id;

    const mechanic = await mechanicModel.findOneAndDelete({
      _id: id,
      ownedBy: clerkUserId,
    });

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mechanic deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mechanic:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMechanicPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkUserId = req.user?.id;

    const mechanic = await mechanicModel
      .findOne({
        _id: id,
        ownedBy: clerkUserId,
      })
      .select("password");

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found or you don't have permission to view it",
      });
    }

    let decryptedPassword = null;
    try {
      if (mechanic.password) {
        decryptedPassword = decryptPassword(mechanic.password);
      }
    } catch (error) {
      console.error("Error decrypting password:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to decrypt password",
      });
    }

    res.status(200).json({
      success: true,
      password: decryptedPassword,
    });
  } catch (error) {
    console.error("Error fetching mechanic password:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMechanicCount = async (req, res) => {
  try {
    const clerkUserId = req.user?.id;
    const { garageId } = req.query; // Get garageId from query params

    let query = { ownedBy: clerkUserId };

    // If garageId is provided, filter by that specific garage
    if (garageId) {
      query.garageId = garageId;
    }

    const count = await mechanicModel.countDocuments(query);

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Error fetching mechanic count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createMechanic,
  getAllMechanics,
  getMechanicById,
  updateMechanic,
  deleteMechanic,
  getMechanicPassword,
  getMechanicCount,
};
