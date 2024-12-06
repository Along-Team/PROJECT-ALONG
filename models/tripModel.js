const mongoose = require("mongoose");
const Route = require("../utils/routegenerator");

const tripSchema = new mongoose.Schema({
  origin: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
  },
  destination: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
  },
  stops: {
    type: [String],
  },
  routeno: {
    type: String,
    required: true,
    default: () => new Route().routeNo(),
  },
  availiability: {
    type: Boolean,
    default: false,
  },
});

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
