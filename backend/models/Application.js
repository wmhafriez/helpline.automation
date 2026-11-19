const mongoose = require("mongoose");

// Convert user-entered text to uppercase
const upper = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toUpperCase();
};

// Vehicle structure
const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      set: upper,
    },

    vehicleModel: {
      type: String,
      required: true,
      set: upper,
    },

    vehicleType: {
      type: String,
      required: true,
      set: upper,
    },

    vehicleColor: {
      type: String,
      required: true,
      set: upper,
    },
  },
  {
    _id: false,
  }
);

// Main application structure
const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      set: upper,
    },

    phoneNumber: {
      type: String,
      required: true,
      set: upper,
    },

    email: {
      type: String,
      required: true,
      set: upper,
    },

    companyName: {
      type: String,
      required: true,
      set: upper,
    },

    staffId: {
      type: String,
      default: "",
      set: upper,
    },

    vehicleNumber: {
      type: String,
      required: true,
      set: upper,
    },

    vehicleModel: {
      type: String,
      required: true,
      set: upper,
    },

    vehicleType: {
      type: String,
      required: true,
      set: upper,
    },

    vehicleColor: {
      type: String,
      required: true,
      set: upper,
    },

    parkingType: {
      type: String,
      required: true,
    },

    subscriptionPeriod: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    vehicles: {
      type: [vehicleSchema],
      default: [],
    },

    referenceNumber: {
      type: String,
      unique: true,
    },

    receiptUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    parkingAssignmentStatus: {
      type: String,
      enum: ["Unassigned", "Assigned"],
      default: "Unassigned",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Automatically update updatedAt
applicationSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("Application", applicationSchema);
