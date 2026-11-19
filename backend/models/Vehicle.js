const mongoose = require("mongoose");

const upper = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toUpperCase();
};

// Vehicle model
const vehicleSchema = new mongoose.Schema({
  parkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parker",
    required: true,
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true,
    set: upper,
  },
  vehicleType: {
    type: String,
    default: "CAR",
    set: upper,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
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

vehicleSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
