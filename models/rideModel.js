const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  driverid: {
    type: mongoose.Schema.ObjectId,
    ref: "Driver",
  },
  driverLocation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: [Number],
    // address: String,
  },
  passengerid: {
    type: mongoose.Schema.ObjectId,
    ref: "Passenger",
  },
  passengerLocation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: [Number],
    // address: String,
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
  },
  endLocation: {
    // GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
  },
  startTime: {
    type: Date,
    default: Date.now(),
  },
  endTime: {
    type: Date,
  },
  distance: {
    type: Number,
  },
  status: {
    type: String,
    // default: "Waiting",
    // enum: ["Waiting", "Moving", "Arrived"],
  },
  // moving: {
  //   type: Boolean,
  //   default: false,
  // },
  // arrived: {
  //   type: Boolean,
  //   default: false,
  // },
});

rideSchema.index({ startLocation: "2dsphere" });
rideSchema.index({ endLocations: "2dsphere" });

rideSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
