const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const paymentSchema = new mongoose.Schema({
  walletReference: {
    type: String,
    unique: true,
  },
  walletName: {
    type: String,
    unique: true,
  },
  customerName: {
    type: String,
    unique: true,
  },
  BVNDetails: {
    bvn: {
      type: String,
    },
    bvnDateofBirth: {
      type: Date,
    },
  },
  customerEmail: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
});

const Moniepay = mongoose.model("Moniepay", paymentSchema);

module.exports = Moniepay;
