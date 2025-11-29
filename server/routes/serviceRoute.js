import express from "express";
import {
  createService,
  allServices,
  getServiceById
} from "../controllers/serviceController.js";
import upload from "../middleware/multer.js";

const serviceRouter = express.Router();

serviceRouter.post(
  "/addService",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  createService
);
serviceRouter.get("/services", allServices);
serviceRouter.get("/services/:id",getServiceById);

export default serviceRouter;
