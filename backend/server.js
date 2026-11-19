const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Application = require("./models/Application");
const Company = require("./models/Company");
const ParkingLot = require("./models/ParkingLot");
const Parker = require("./models/Parker");
const Vehicle = require("./models/Vehicle");
const ParkingAssignment = require("./models/ParkingAssignment");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

app.get("/", (req, res) => {
  res.json({
    message: "HiSpeedCity Application API is running",
  });
});

// CREATE APPLICATION
app.post("/api/applications", async (req, res) => {
  try {
    const count = await Application.countDocuments();

    const referenceNumber =
      "APP" + String(count + 1).padStart(5, "0");

    const application = await Application.create({
      ...req.body,
      referenceNumber,
      status: "Pending",
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET ALL APPLICATIONS
app.get("/api/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({
      submittedAt: -1,
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// APPROVE APPLICATION
app.put("/api/applications/:id/approve", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = "Approved";
    application.updatedAt = new Date();

    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// REJECT APPLICATION
app.put("/api/applications/:id/reject", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = "Rejected";
    application.updatedAt = new Date();

    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET APPROVED RESERVED APPLICATIONS
app.get("/api/parking/approved-reserved", async (req, res) => {
  try {
    const applications = await Application.find({
      status: "Approved",
      parkingType: "Reserved",
      parkingAssignmentStatus: { $ne: "Assigned" },
    }).sort({ updatedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all active companies
app.get("/api/companies", async (req, res) => {
  try {
    const companies = await Company.find({
      status: "ACTIVE",
    }).sort({ name: 1 });

    res.json(companies);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create company
// Create company
app.post("/api/companies", async (req, res) => {
  try {
    const name = req.body.name?.trim().toUpperCase();

    if (!name) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });

    if (existingCompany) {
      return res.json(existingCompany);
    }

    // Generate company code
    const baseCode =
      name.replace(/[^A-Z0-9]/g, "").substring(0, 5) || "COMP";

    let companyCode = baseCode;
    let number = 1;

    while (await Company.findOne({ companyCode })) {
      companyCode = `${baseCode}${number}`;
      number++;
    }

    const company = await Company.create({
      name,
      companyCode,
      status: "ACTIVE",
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get all parking lots
app.get("/api/parking-lots", async (req, res) => {
  try {
    const lots = await ParkingLot.find();

    const floorOrder = {
      GF: 0,
      P1: 1,
      P2: 2,
      P3: 3,
    };

    lots.sort((a, b) => {
      const floorDifference =
        floorOrder[a.floorCode] -
        floorOrder[b.floorCode];

      if (floorDifference !== 0) {
        return floorDifference;
      }

      return a.lotNumber.localeCompare(
        b.lotNumber,
        undefined,
        { numeric: true }
      );
    });

    res.json(lots);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get available parking lots
app.get("/api/parking-lots/available", async (req, res) => {
  try {
    const lots = await ParkingLot.find({
      status: "AVAILABLE",
    });

    const floorOrder = {
      GF: 0,
      P1: 1,
      P2: 2,
      P3: 3,
    };

    lots.sort((a, b) => {
      const floorDifference =
        floorOrder[a.floorCode] -
        floorOrder[b.floorCode];

      if (floorDifference !== 0) {
        return floorDifference;
      }

      return a.lotNumber.localeCompare(
        b.lotNumber,
        undefined,
        { numeric: true }
      );
    });

    res.json(lots);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create parking lot
app.post("/api/parking-lots", async (req, res) => {
  try {
    const lot = await ParkingLot.create({
      floorCode: req.body.floorCode,
      lotNumber: req.body.lotNumber,
      status: req.body.status || "AVAILABLE",
    });

    res.status(201).json(lot);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create parking assignment
app.post("/api/parking-assignments", async (req, res) => {
  try {
    const {
      applicationId,
      parkerName,
      companyId,
      plateNumber,
      parkingLotId,
    } = req.body;

    if (!parkerName || !plateNumber || !parkingLotId) {
      return res.status(400).json({
        message: "Parker name, plate number and parking lot are required",
      });
    }

    const parkingLot = await ParkingLot.findById(parkingLotId);

    if (!parkingLot) {
      return res.status(404).json({
        message: "Parking lot not found",
      });
    }

    if (parkingLot.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "Parking lot is not available",
      });
    }

    // Create parker
    const parker = await Parker.create({
      name: parkerName,
      companyId: companyId || null,
      status: "ACTIVE",
    });

    // Check whether vehicle already exists
    let vehicle = await Vehicle.findOne({
      plateNumber: plateNumber.toUpperCase(),
    });

    if (vehicle && vehicle.status === "ACTIVE") {
      await Parker.findByIdAndDelete(parker._id);

      return res.status(400).json({
        message: `Plate ${plateNumber.toUpperCase()} is already registered`,
      });
    }

    // Reactivate existing vehicle
    if (vehicle) {
      vehicle.parkerId = parker._id;
      vehicle.status = "ACTIVE";
      vehicle.updatedAt = new Date();
      await vehicle.save();
    } else {
      vehicle = await Vehicle.create({
        parkerId: parker._id,
        plateNumber,
        vehicleType: "CAR",
        status: "ACTIVE",
      });
    }

    // Create parking assignment
    const assignment = await ParkingAssignment.create({
      applicationId: applicationId || null,
      parkerId: parker._id,
      vehicleId: vehicle._id,
      parkingLotId: parkingLot._id,
      status: "ACTIVE",
    });

    // Mark lot as occupied
    parkingLot.status = "OCCUPIED";
    parkingLot.updatedAt = new Date();
    await parkingLot.save();

    // Mark application as assigned
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, {
        parkingAssignmentStatus: "Assigned",
        updatedAt: new Date(),
      });
    }

    const populatedAssignment =
      await ParkingAssignment.findById(assignment._id)
        .populate("parkerId")
        .populate("vehicleId")
        .populate("parkingLotId")
        .populate("parkerId.companyId");

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get parking assignments
app.get("/api/parking-assignments", async (req, res) => {
  try {
    const assignments = await ParkingAssignment.find({
      status: "ACTIVE",
    })
      .populate({
        path: "parkerId",
        populate: {
          path: "companyId",
        },
      })
      .populate("vehicleId")
      .populate("parkingLotId")
      .sort({ assignedAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get complete parking layout from MongoDB
app.get("/api/parking-layout", async (req, res) => {
  try {
    const lots = await ParkingLot.find().lean();

    const assignments = await ParkingAssignment.find({
      status: "ACTIVE",
    })
      .populate({
        path: "parkerId",
        populate: {
          path: "companyId",
        },
      })
      .populate("vehicleId")
      .lean();

    const assignmentsByLot = new Map();

    for (const assignment of assignments) {
      assignmentsByLot.set(
        String(assignment.parkingLotId),
        assignment
      );
    }

    const layout = lots.map((lot) => {
      const assignment = assignmentsByLot.get(
        String(lot._id)
      );

      return {
        id: String(lot._id),
        lot_number: lot.lotNumber,
        status: lot.status,

        floor: {
          floor_code: lot.floorCode,
        },

        assignments: assignment
          ? [
              {
                id: String(assignment._id),
                status: assignment.status,

                parker: {
                  id: String(
                    assignment.parkerId?._id || ""
                  ),
                  name:
                    assignment.parkerId?.name || "",
                  company:
                    assignment.parkerId?.companyId
                      ? {
                          name:
                            assignment.parkerId
                              .companyId.name,
                        }
                      : undefined,
                },

                vehicle: {
                  id: String(
                    assignment.vehicleId?._id || ""
                  ),
                  plate_number:
                    assignment.vehicleId
                      ?.plateNumber || "",
                },

                // Tag migration will be done later
                tags: [],
              },
            ]
          : [],
      };
    });

    const floorOrder = {
      GF: 0,
      P1: 1,
      P2: 2,
      P3: 3,
    };

    layout.sort((a, b) => {
      const floorA =
        floorOrder[a.floor.floor_code] ?? 999;

      const floorB =
        floorOrder[b.floor.floor_code] ?? 999;

      if (floorA !== floorB) {
        return floorA - floorB;
      }

      return a.lot_number.localeCompare(
        b.lot_number,
        undefined,
        { numeric: true }
      );
    });

    res.json(layout);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get active parkers from MongoDB
app.get("/api/parkers", async (req, res) => {
  try {
    const parkers = await Parker.find({
      status: "ACTIVE",
    })
      .populate("companyId")
      .sort({ name: 1 });

    res.json(parkers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get active vehicles from MongoDB
app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      status: "ACTIVE",
    }).sort({ plateNumber: 1 });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Mark application as assigned
// Mark application as assigned
app.put("/api/applications/:id/assigned", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          parkingAssignmentStatus: "Assigned",
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
