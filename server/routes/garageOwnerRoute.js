import express from "express";
import {
  creatGarage,
  getAllGarages,
  updateGarage,
  deleteGarage,
} from "../controllers/garageManagementController.js";
import {
  createMechanic,
  getAllMechanics,
  getMechanicById,
  updateMechanic,
  deleteMechanic,
  getMechanicPassword,
  getMechanicCount,
} from "../controllers/mechanicController.js";
import {
  listgaragereservations,
  getAllReservations,
  getAllClients,
  updateReservation,
  declineReservation,
} from "../controllers/reservationManagementController.js";

import multer from "multer";
import { authenticateUser } from "../middleware/auth.js";
import { join } from "path";

const garageOwnerRoute = express.Router();
const upload = multer({ dest: "uploads/" });

garageOwnerRoute.post(
  "/create",
  authenticateUser,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  creatGarage
);

garageOwnerRoute.get("/my-garages", authenticateUser, getAllGarages);

garageOwnerRoute.put(
  "/garage/:id",
  authenticateUser,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateGarage
);

garageOwnerRoute.delete("/garage/:id", authenticateUser, deleteGarage);

garageOwnerRoute.post(
  "/reservations",
  authenticateUser,
  listgaragereservations
);

garageOwnerRoute.post("/create-mechanic", authenticateUser, createMechanic);
garageOwnerRoute.get("/mechanics", authenticateUser, getAllMechanics);
garageOwnerRoute.get("/mechanic/:id", authenticateUser, getMechanicById);
garageOwnerRoute.get("/mechanic/:id/password", authenticateUser, getMechanicPassword);
garageOwnerRoute.put("/mechanic/:id", authenticateUser, updateMechanic);
garageOwnerRoute.delete("/mechanic/:id", authenticateUser, deleteMechanic);
garageOwnerRoute.get("/mechanics/count", authenticateUser, getMechanicCount);
garageOwnerRoute.get("/reservations/all", authenticateUser, getAllReservations);



garageOwnerRoute.put(
  "/reservation/decline",
  authenticateUser,
  declineReservation
);


garageOwnerRoute.put("/reservations/update", authenticateUser, updateReservation);


garageOwnerRoute.get("/clients", authenticateUser, getAllClients);

export default garageOwnerRoute;
