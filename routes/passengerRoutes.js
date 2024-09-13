const express = require("express");
const passengerController = require("./../controllers/passengerController");

const router = express.Router();

router.post("/signup", passengerController.signup);
router.post("/verifysignup", passengerController.verifyContact);
router.post("/login", passengerController.login);
router.post("/forgotpassword", passengerController.forgotPassword);
router.post("/resetpassword", passengerController.resetPassword);
router.patch(
  "/update/:id",
  passengerController.protect,
  passengerController.updatePassenger
);

module.exports = router;
