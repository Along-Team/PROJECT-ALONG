const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const passengerSchema = new mongoose.Schema({
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
  cardNumber: {
    type: String,
    unique: true,
  },
  cvv: {
    type: String,
    length: 3,
  },
  expDate: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
    // select: false,
  },
  role: {
    type: String,
    enum: ["passenger", "driver"],
    default: "passenger",
  },
});

passengerSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password verify field
  this.verifypassword = undefined;
  next();
});

passengerSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  // if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.cardNumber = await bcrypt.hash(this.cardNumber, 12);
  this.cvv = await bcrypt.hash(this.cvv, 10);
  this.expDate = await bcrypt.hash(this.expDate, 10);
  next();
});

passengerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

passengerSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

const Passenger = mongoose.model("Passenger", passengerSchema);

module.exports = Passenger;
