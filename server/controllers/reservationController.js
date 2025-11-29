import reservationModel from "../models/reservationModel.js";
import garageModel from "../models/garage.js";
import mongoose from "mongoose";

const createReservation = async (req, res) => {
  try {
    const { serviceId, garageId, carId, reservationDate, tel, description } =
      req.body;

    const userId = req.user?.id;

    if (!userId || !serviceId || !garageId || !carId || !reservationDate) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields are needed" });
    }

    const reservationDateObj = new Date(reservationDate);
    if (isNaN(reservationDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Reservation date is invalid",
      });
    }

    const garage = await garageModel.findById(garageId);
    if (!garage) {
      return res.status(404).json({
        success: false,
        message: "Selected garage was not found",
      });
    }

    const openingHours = garage.openingHours || {};
    const openHour = Number(openingHours.open);
    const closeHour = Number(openingHours.close);

    if (
      Number.isInteger(openHour) &&
      Number.isInteger(closeHour) &&
      openHour < closeHour
    ) {
      const reservationHour =
        reservationDateObj.getHours() + reservationDateObj.getMinutes() / 60;
      if (reservationHour < openHour || reservationHour >= closeHour) {
        return res.status(400).json({
          success: false,
          message: `Reservations must be scheduled between ${openHour}:00 and ${closeHour}:00`,
        });
      }
    }

    const newReservation = new reservationModel({
      userId: userId,
      serviceId: new mongoose.Types.ObjectId(serviceId),
      garageId: new mongoose.Types.ObjectId(garageId),
      carId: new mongoose.Types.ObjectId(carId),
      reservationDate: reservationDateObj,
      tel: tel || "",
      description: description || "",
    });

    await newReservation.save();

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation: newReservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReservationById = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User authentication required" });
    }

    const reservations = await reservationModel
      .find({ userId: userId })
      .populate("serviceId", "name description")
      .populate("garageId", "name location")
      .populate("carId", "brand model year plate")
      .lean();

    if (!reservations.length) {
      return res.status(200).json({
        success: true,
        reservations: [],
        message: "No reservations found for this user",
      });
    }

    res.json({ success: true, reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;
    const userId = req.user?.id;

    if (!reservationId) {
      return res.status(400).json({
        success: false,
        message: "Reservation ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const reservation = await reservationModel.findOne({
      _id: reservationId,
      userId: userId,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found or you don't have permission to cancel it",
      });
    }

    // Delete the reservation
    await reservationModel.deleteOne({ _id: reservationId });

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createReservation, getReservationById, cancelReservation };
