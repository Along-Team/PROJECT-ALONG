const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const driverSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: 8,
    //select: false
  },
  verifypassword: {
    type: String,
    // required: [true, "Please enter a password"],
    minlength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  contact: {
    type: String,
    unique: true,
    minlength: 11,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  active: {
    type: Boolean,
    default: false,
    // select: false,
  },
  emailVerifyToken: {
    type: String,
  },
  emailVerifyExpires: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["passenger", "driver"],
    default: "driver",
  },
});

// driverSchema.index({ location: "2dsphere" });

//Virtual Populate
driverSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "driver",
  localField: "_id",
});

driverSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password verify field
  this.verifypassword = undefined;
  next();
});

// driverSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

// To generate token to verify password
driverSchema.methods.createAccountVerifyToken = function () {
  const verifyToken = crypto.randomBytes(32).toString("hex");

  this.emailVerifyToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  console.log({ verifyToken }, this.emailVerifyToken);

  this.emailVerifyExpires = Date.now() + 40 * 120 * 120 * 1000;

  return verifyToken;
};

driverSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

driverSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
