const mongoose = require("mongoose");

const upper = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toUpperCase();
};

// Parker model
const parkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: upper,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default: null,
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

parkerSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("Parker", parkerSchema);
