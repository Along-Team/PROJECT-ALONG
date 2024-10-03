const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;
