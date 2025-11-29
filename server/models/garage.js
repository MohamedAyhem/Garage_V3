import mongoose from "mongoose";

const garageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
  photos: {
    type: Array,
    required: true,
  },
  description: String,
  capacity: {
    type: Number,
    required: true,
  },
  openingHours: {
    type: mongoose.Schema.Types.Mixed, // Allows both object {open, close} and number
  },
  Ownedby: {
    type: String, // Clerk user ID - optional for backward compatibility
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

garageSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  }
);

const garageModel =
  mongoose.models.garage || mongoose.model("garage", garageSchema);
export default garageModel;
