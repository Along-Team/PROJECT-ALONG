const mongoose = require("mongoose");

const driverKycSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  licenceNumber: {
    type: String,
    unique: true,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  licencePhoto: {
    type: String,
    required: true,
  },
});

const DriverDetails = mongoose.model("DriverDetails", driverKycSchema);

module.exports = DriverDetails;
