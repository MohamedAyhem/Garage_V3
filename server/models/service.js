import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  image: [String],
  garages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "garage",
    },
  ],
  status: {
    type: String,
    default: "waiting",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const serviceModel =
  mongoose.models.service || mongoose.model("service", serviceSchema);

export default serviceModel;
