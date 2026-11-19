const mongoose = require("mongoose");

const upper = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toUpperCase();
};

// Parking lot model
const parkingLotSchema = new mongoose.Schema({
  floorCode: {
    type: String,
    required: true,
    enum: ["GF", "P1", "P2", "P3"],
    set: upper,
  },
  lotNumber: {
    type: String,
    required: true,
    set: upper,
  },
  status: {
    type: String,
    enum: [
      "AVAILABLE",
      "OCCUPIED",
      "PENDING_INSTALLATION",
      "PENDING_REMOVAL",
    ],
    default: "AVAILABLE",
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

// Prevent duplicate lot numbers on the same floor
parkingLotSchema.index(
  {
    floorCode: 1,
    lotNumber: 1,
  },
  {
    unique: true,
  }
);

parkingLotSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model(
  "ParkingLot",
  parkingLotSchema
);
