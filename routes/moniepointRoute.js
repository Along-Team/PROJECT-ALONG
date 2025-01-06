const express = require("express");
const moniepointController = require("./../controllers/moniepointController");

const router = express.Router();

router.post("/createwallet", moniepointController.createWallet);

module.exports = router;
