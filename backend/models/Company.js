const mongoose = require("mongoose");

const upper = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toUpperCase();
};

// Company model
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: upper,
  },
  companyCode: {
    type: String,
    required: true,
    unique: true,
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

companySchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("Company", companySchema);
