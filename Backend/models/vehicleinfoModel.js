const mongoose = require("mongoose");
const Driver = require("../models/driverModel")

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  plateNumber: {
    type: String,
    unique: true,
  },
  vehicleType: {
    type: String,
    required: true,
  },
  vehicleColour: {
    type: String,
    required: true,
  },
  inspDate: {
    type: Date,
    required: true,
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'Driver',
    required: [true, 'Review must belong to a driver'],
  },
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;
