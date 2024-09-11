const express = require("express");
const reviewController = require("../controllers/ratingController");
const authController = require("./../controllers/authController");
const passauthController = require("../controllers/passengerController")
const router = express.Router({ mergeParams: true });

 router.use(passauthController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    // authController.restrictTo("passenger"),
    reviewController.setTourUserIds,
    reviewController.createReviews
  );

module.exports = router;
