const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Passenger = require("./../models/passengerModel");
const OTP = require("../models/otpModel");
const SMSService = require("../utils/sendSMS");
const AppError = require("./../utils/appError");
const factory = require("./handlefactory");
const TwilioService = require("../utils/sendSMS");

const { access } = require("fs");

require("dotenv").config;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (passenger, statusCode, res) => {
  const token = signToken(passenger._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from input
  passenger.password = undefined;

  res.status(statusCode).json({
    status: "Succcess",
    token,
    data: {
      passenger,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //1) Generate a 5-digit OTP
  const otp = Math.random().toString().substring(2, 7);

  const newPassenger = await Passenger.create(req.body);

  // 2) Store OTP with the contact information
  const otpEntry = new OTP({
    contact: req.body.contact,
    otp: otp,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
  });
  await otpEntry.save();

  // 3) Send it to the passenger's phone number
  const twilioService = new TwilioService(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    "ALONG APP" // SenderID
  );

  try {
    await twilioService.sendSMS(req.body.contact, otp);
    res.status(200).json({
      status: "success",
      message: "OTP sent to your phone number.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to send OTP.",
      error: error.message,
    });
  }
});

// exports.signup = catchAsync(async (req, res, next) => {
//   //1) Generate a 5-digit OTP
//   const otp = Math.random().toString().substring(2, 7);

//   const newPassenger = await Passenger.create(req.body);

//   // 2) Store OTP with the contact information
//   const otpEntry = new OTP({
//     contact: req.body.contact,
//     otp: otp,
//     expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
//   });
//   await otpEntry.save();

//   //3) send otp to passenger's email address
//   const resend = new Resend(process.env.RESEND_API_KEY);

//   try {
//     const { data, error } = await resend.emails.send({
//       from: "Along App <onboarding@resend.dev>",
//       to: email,
//       subject: "Welcome To along, Please Verify Your Email Address",
//       html: ` <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>Verify Your Email</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           background-color: #f4f4f4;
//           margin: 0;
//           padding: 0;
//         }
//         .container {
//           max-width: 600px;
//           margin: 0 auto;
//           background-color: #ffffff;
//           padding: 20px;
//           border-radius: 8px;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//         }
//         .header {
//           text-align: center;
//           padding: 10px 0;
//         }
//         .header h1 {
//           margin: 0;
//           color: #333333;
//         }
//         .content {
//           margin: 20px 0;
//         }
//         .content p {
//           color: #666666;
//           line-height: 1.6;
//         }
//         .otp {
//           font-size: 24px;
//           font-weight: bold;
//           color: #333333;
//           text-align: center;
//           margin: 20px 0;
//         }
//         .footer {
//           text-align: center;
//           padding: 10px 0;
//           color: #999999;
//           font-size: 12px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Welcome to Along!</h1>
//         </div>
//         <div class="content">
//           <p>Hi {{name}},</p>
//           <p>Thank you for signing up with Along. Please use the following OTP to verify your email address:</p>
//           <div class="otp">{{otp}}</div>
//           <p>This OTP is valid for 24 hours. If you did not request this, please ignore this email.</p>
//         </div>
//         <div class="footer">
//           <p>&copy; 2023 Along. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>`,
//     });
//     if (error) {
//       return res.status(400).json({ error });
//     }
//     res.status(200).json({
//       status: "success",
//       message: "OTP sent to your email .",
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: "Failed to send OTP.",
//       error: error.message,
//     });
//   }
// });

exports.resendOTP = catchAsync(async (req, res, next) => {
  // Generate a 5-digit OTP
  const otp = Math.random().toString().substring(2, 7);

  const otpEntry = new OTP({
    contact: req.body.contact,
    otp: otp,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
  });
  await otpEntry.save();

  // 3) Send it to the passenger's phone number
  const twilioService = new TwilioService(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    "ALONG APP" // SenderID
  );

  try {
    await twilioService.sendSMS(req.body.contact, otp);
    res.status(200).json({
      status: "success",
      message: "OTP sent to your phone number.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to send OTP.",
      error: error.message,
    });
  }
});

exports.verifyContact = async (req, res, next) => {
  const { contact, otp } = req.body;

  // Find the OTP entry
  const otpEntry = await OTP.findOne({ contact });
  console.log("OTP Entry found:", otpEntry);

  if (!otpEntry || otpEntry.expiresAt < Date.now()) {
    return res.status(400).json({
      status: "fail",
      message: "OTP is invalid or has expired.",
    });
  }

  // Verify the OTP
  if (otp !== otpEntry.otp) {
    return res.status(400).json({
      status: "fail",
      message: "OTP is incorrect.",
    });
  }

  //Delete the OTP entry
  await OTP.deleteOne({ otp });

  // console.log("Contact received:", contact);
  const passenger = await Passenger.findOne({ contact });

  // 3) Update Passenger Status
  passenger.active = true;
  await passenger.save();

  // 4) Log the PASSENGER in, send JWT
  createSendToken(passenger, 200, res);
};

exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  // 1) Check if email and password exist
  if (!userName || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) Check if user exist and password is correct
  const passenger = await Passenger.findOne({ userName }).select("+password");

  if ((await passenger.active) != true) {
    return next(new AppError("Kindly verify your contact", 401));
  }

  if (
    !passenger ||
    !(await passenger.correctPassword(password, passenger.password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) if everything ok, send token to client
  createSendToken(passenger, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in!. Please login", 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentDriver = await Passenger.findById(decoded.id);
  console.log(currentDriver);
  if (!currentDriver) {
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  }

  // GRANT ACCESS TO USER
  req.driver = currentDriver;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const passenger = await Passenger.findOne({ contact: req.body.contact });
  if (!passenger) {
    return next(new AppError("There is no Driver with the phone number", 404));
  }

  // 2)  Generate a 5-digit OTP
  const otp = Math.random().toString().substring(2, 7);
  // const otp = driver.;
  const otpEntry = new OTP({
    contact: req.body.contact,
    otp: otp,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 24 hours expiry
  });
  await otpEntry.save({ validateBeforeSave: false });

  // 3) Send it to the driver's phone number
  const twilioService = new TwilioService(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    "ALONG APP" // SenderID
  );

  try {
    await twilioService.sendSMS(req.body.contact, otp);
    res.status(200).json({
      status: "success",
      message: "OTP sent to your phone number.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to send OTP.",
      error: error.message,
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get driver based on the otp
  const contact = req.body.contact;
  const otp = req.body.otp;

  // Find the OTP entry
  const otpEntry = await OTP.findOne({ contact });
  console.log("OTP Entry found:", otpEntry);

  if (!otpEntry || otpEntry.expiresAt < Date.now()) {
    return res.status(400).json({
      status: "fail",
      message: "OTP is invalid or has expired.",
    });
  }

  // Verify the OTP
  if (otp !== otpEntry.otp) {
    return res.status(400).json({
      status: "fail",
      message: "OTP is incorrect.",
    });
  }

  //Delete the OTP entry
  await OTP.deleteOne({ otp });

  const password = req.body.password;
  const verify = req.body.verifypassword;

  const passenger = await Passenger.findOne({ contact });

  // 2) If token has not expired, and there is user, set the new password
  if (!passenger) {
    return next(new AppError("Driver not found", 400));
  }
  passenger.password = password;
  passenger.verifypassword = verify;
  // driver.passwordResetToken = undefined;
  // driver.passwordResetExpires = undefined;
  await passenger.save();

  // 3) Log the user in, send JWT
  createSendToken(passenger, 200, res);
});

// exports.updatePassenger = catchAsync(async (req, res, next) => {
//   const passenger = await Passenger.findByIdAndUpdate(req.params.id, req.body);
// });
exports.updatePassenger = factory.updateOne(Passenger);
