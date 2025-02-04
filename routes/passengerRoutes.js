const express = require("express");
const passengerController = require("./../controllers/passengerController");
const { uploadImage } = require("../controllers/passengerController");
const { upload } = require("../controllers/passengerController"); // Assuming Multer setup is exported here

const router = express.Router();

router.post("/signup", passengerController.signup);
router.post("/resendotp", passengerController.resendOTP);
router.post("/verifysignup", passengerController.verifyContact);
router.post("/login", passengerController.login);
router.post("/forgotpassword", passengerController.forgotPassword);
router.post("/resetpassword", passengerController.resetPassword);
router.patch(
  "/update/:id",
  passengerController.protect,
  passengerController.updatePassenger
);

// Use upload.single('image') to handle the image upload, and then call the controller
router.post("/upload", upload.single("image"), uploadImage);
router.get("/image/:filename", passengerController.getImage);
module.exports = router;
