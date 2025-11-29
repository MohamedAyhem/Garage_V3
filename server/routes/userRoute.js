import express from "express";
import {
  registerUser,
  setGarageOwnerMetadata,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/set-garage-owner", setGarageOwnerMetadata);

export default userRouter;
