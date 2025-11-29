import mongoose from "mongoose";

const mechanicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  ownedBy: {
    type: String,
    required: true,
  },
  garageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "garage",
    required: true,
  },
  tasksAssigned: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
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

// Add index for efficient filtering by owner and garage
mechanicSchema.index({ ownedBy: 1, garageId: 1 });

const mechanicModel =
  mongoose.models.mechanic || mongoose.model("mechanic", mechanicSchema);
export default mechanicModel;
