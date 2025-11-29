import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  plate: {
    type: String,
    required: true,
    unique: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  mileage: {
    type: Number,
    default: 0,
    min: 0,
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
  },
  make_id: {
    type: String,
    required: false,
  },
  model_id: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

carSchema.index({ plate: 1 });

carSchema.index({ userId: 1, isDefault: 1 });

const Car = mongoose.model("Car", carSchema);
export default Car;
