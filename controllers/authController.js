const crypto = require("crypto");
const twilio = require("twilio");
// const Resend = require("resend");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const Driver = require("./../models/driverModel");
const OTP = require("../models/otpModel");
const AppError = require("./../utils/appError");
const TwilioService = require("../utils/sendSMS");
const dotenv = require("dotenv");
// const { access } = require("fs");
const sendEmail = require("../utils/sendEmail");

dotenv.config();

require("dotenv").config;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (driver, statusCode, res) => {
  const token = signToken(driver._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from input
  driver.password = undefined;

  res.status(statusCode).json({
    status: "Succcess",
    token,
    data: {
      driver,
    },
  });
};

exports.initiateSignup = catchAsync(async (req, res, next) => {
  // Generate a 5-digit OTP
  const otp = Math.random().toString().substring(2, 7);

  const newDriver = await Driver.create(req.body);
  // const newDriver = await Driver.create({
  //   email: req.body.email,
  //   userName: req.body.userName,
  //   password: req.body.password,
  //   contact: req.body.contact,
  //   photo: req.body.photo,
  // });

  // Store OTP with the contact information
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

  //4) send otp to passenger's email address
  // const resend = new Resend(process.env);

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

exports.initiateSignupWithEmail = catchAsync(async (req, res, next) => {
  // Generate a 5-digit OTP
  const otp = Math.random().toString().substring(2, 7);

  const newDriver = await Driver.create(req.body);

  // Store OTP with the contact information
  const otpEntry = new OTP({
    email: req.body.email,
    otp: otp,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
  });
  await otpEntry.save();

  // Generate the random email verification token
  const verifyToken = newDriver.createAccountVerifyToken();
  await newDriver.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const verificationURL = `${req.protocol}://${req.get(
    "host"
  )}/api/drivers/verifyEmail/${verifyToken}`;

  const message = `Welcome to AlongApp! To verify your email, please submit a PATCH request to: ${verificationURL}.\n And attach the ${otp}, if you didn't sign up for an account, please ignore this email!`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Verify Your Email Address",
      message,
    });
    // console.log(req.body.email);
    res.status(200).json({
      status: "success",
      message: "Verification token sent to email!",
    });
  } catch (err) {
    // Handle the error, e.g., return a 500 status code
    console.log(err);
    return next(new AppError("Email Verification not sent", 500));
  }
});

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

exports.verifyEmail = async (req, res, next) => {
  // 1) Get USER based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await Driver.findOne({
    where: {
      emailVerifyToken: hashedToken,
    },
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Update the ACTIVATED, EMAILVERIFYTOKEN and EMAILVERIFYEXPIRES
  user.activated = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  // 4) Log the USER in, send JWT
  createSendToken(user, 200, res);
};

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
  const driver = await Driver.findOne({ contact });
  if (!driver) {
    return res.status(404).json({
      status: "fail",
      message: "Driver not found.",
    });
  }

  // 3) Update Driver Status
  driver.active = true;
  await driver.save();

  // 4) Log the DRIVER in, send JWT
  createSendToken(driver, 200, res);
};

exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  // 1) Check if email and password exist
  if (!userName || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) Check if user exist and password is correct
  const driver = await Driver.findOne({ userName }).select("+password");

  if ((await driver.active) != true) {
    return next(new AppError("Kindly verify your contact", 401));
  }

  if (!driver || !(await driver.correctPassword(password, driver.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // 3) if everything ok, send token to client
  createSendToken(driver, 200, res);
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
  const currentDriver = await Driver.findById(decoded.id);
  console.log(currentDriver);
  if (!currentDriver) {
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  //-- Broken
  // if (currentDriver.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError("User recently changed password! Please log in again", 401)
  //   );
  // }

  // GRANT ACCESS TO USER
  req.driver = currentDriver;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles[("passenger", "driver")].role = "user";
    // if (req.user.role === "passenger") {
    //   req.user.role = "user";
    // }
    if (!roles.includes(req.role)) {
      return next(
        new AppError("You do not permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const driver = await Driver.findOne({ contact: req.body.contact });
  if (!driver) {
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

  const driver = await Driver.findOne({ contact });

  // 2) If token has not expired, and there is user, set the new password
  if (!driver) {
    return next(new AppError("Driver not found", 400));
  }
  driver.password = password;
  driver.verifypassword = verify;
  // driver.passwordResetToken = undefined;
  // driver.passwordResetExpires = undefined;
  await driver.save();

  // 3) Log the user in, send JWT
  createSendToken(driver, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get Driver from collection
  const driver = await Driver.findById(req.user.id).select("+password");
  // 2) Check if POSTed current password is correct
  if (
    !(await driver.correctPassword(req.body.passwordCurrent, driver.password))
  ) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3) If so update password
  driver.password = req.body.password;
  driver.passwordConfirm = req.body.passwordConfirm;
  await driver.save();

  // 4) Log User in, send JWT
  createSendToken(driver, 200, res);
});

// exports.signWithGoogle = catchAsync(async (req, res, next) => {

// const CLIENT_ID = 'YOUR_CLIENT_ID';
// const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
// const REDIRECT_URI = '<http://localhost:3000/auth/google/callback>';

// // Initiates the Google Login flow
// router.get('/auth/google', (req, res) => {
//   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
//   res.redirect(url);
// });

// Callback URL for handling the Google Login response
// router.get('/auth/google/callback', async (req, res) => {
//   const { code } = req.query;

//   try {
//     // Exchange authorization code for access token
//     const { data } = await axios.post('<https://oauth2.googleapis.com/token>', {
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       code,
//       redirect_uri: REDIRECT_URI,
//       grant_type: 'authorization_code',
//     });

//     const { access_token, id_token } = data;

//     // Use access_token or id_token to fetch user profile
//     const { data: profile } = await axios.get('<https://www.googleapis.com/oauth2/v1/userinfo>', {
//       headers: { Authorization: `Bearer ${access_token}` },
//     });

//     // Code to handle user authentication and retrieval using the profile data

//     res.redirect('/');
//   } catch (error) {
//     console.error('Error:', error.response.data.error);
//     res.redirect('/login');
//   }
// });

// });
