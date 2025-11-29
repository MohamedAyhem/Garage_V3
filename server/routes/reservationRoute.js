import express from "express";
import {
  createReservation,
  getReservationById,
  cancelReservation,
} from "../controllers/reservationController.js";
import { authenticateUser } from "../middleware/auth.js";

const reservationRouter = express.Router();

reservationRouter.post(
  "/createReservation",
  authenticateUser,
  createReservation
);
reservationRouter.get("/reservations", authenticateUser, getReservationById);
reservationRouter.delete("/cancel", authenticateUser, cancelReservation);

export default reservationRouter;
