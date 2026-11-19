const mongoose = require("mongoose");

// Parking assignment model
const parkingAssignmentSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    default: null,
  },
  parkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parker",
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingLot",
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "CANCELLED"],
    default: "ACTIVE",
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

parkingAssignmentSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model(
  "ParkingAssignment",
  parkingAssignmentSchema
);
