import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import garageRouter from "./routes/garageRoute.js";
import serviceRouter from "./routes/serviceRoute.js";
import reservationRouter from "./routes/reservationRoute.js";
import carRoute from "./routes/carRoute.js";
import garageOwnerRoute from "./routes/garageOwnerRoute.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for form data)
app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/user", userRouter);
app.use("/api/garage", garageRouter);
app.use("/api/service", serviceRouter);
app.use("/api/Reservation", reservationRouter);
app.use("/api/cars", carRoute);
app.use("/api/garage-owner", garageOwnerRoute);

app.get("/", (req, res) => {
  res.send("APIs WORKING");
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(port, () => {
  console.log("Server started on PORT: " + port);
  console.log("Test Server: http://localhost:" + port);
});
