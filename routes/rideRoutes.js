const express = require("express");
const rideController = require("./../controllers/rideController");
//const authController = require('./../controllers/authController');

const router = express.Router();

// router.route("/createride").post(rideController.createRide);
router.get("/recentride/:passengerid", rideController.recentRide);

// router.route("/distances/:latlng/unit/:unit").get(rideController.getDistances);

module.exports = router;
