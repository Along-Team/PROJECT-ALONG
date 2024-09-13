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
    default: "Waiting",
    enum: ["Waiting", "Moving", "Arrived"],
  },
  moving: {
    type: Boolean,
    default: false,
  },
  arrived: {
    type: Boolean,
    default: false,
  },
});

rideSchema.index({ startLocation: "2dsphere" });
rideSchema.index({ endLocations: "2dsphere" });

rideSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});
// driverSchema.pre("save", async function (next) {
//   // Only run this function if password was actually modified
//   if (!this.isModified("password")) return next();

//   // Hash the password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);

//   // Delete password confirm field
//   this.passwordConfirm = undefined;
//   next();
// });

// driverSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

// driverSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// driverSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );
//     // console.log(changedTimestamp, JWTTimestamp);
//     return JWTTimestamp < changedTimestamp;
//   }
//   // False means not changed
//   return false;
// };

// driverSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");

//   this.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   console.log({ resetToken }, this.passwordResetToken);

//   this.passwordResetExpires = Date.now() + 70 * 60 * 1000;

//   return resetToken;
// };

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
