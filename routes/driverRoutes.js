const express = require("express");
const driverController = require("./../controllers/driverController");
const authController = require("./../controllers/authController");
const vehicleinfoController = require("../controllers/vehicleinfoController");

const router = express.Router();

// Driver Routes
router.post("/signup", authController.initiateSignup);
router.post("/signupwithemail", authController.initiateSignupWithEmail);
// create a resend OTP endpoint same as verifysignup
router.post("/verifysignupwithemail", authController.verifyEmail);
router.post("/verifysignup", authController.verifyContact);
router.post("/login", authController.login);
// router.get('/logout', authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);

// Driver Vehicle Info Routes
router.post("/vehicleinfo", vehicleinfoController.createVehicleInfo);
router
  .route("/updatevehicleinfo/:id")
  .patch(authController.protect, vehicleinfoController.updateVehicleInfo);

router
  .route("/drivers-within/:distance/pass/:passengerLocation/unit/:unit")
  .get(driverController.getDriversWithin);
// /tour-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

module.exports = router;
