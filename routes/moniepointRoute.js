const express = require("express");
const moniepointController = require("./../controllers/moniepointController");

const router = express.Router();

router.post("/createwallet", moniepointController.createWallet);
router.get(
  "/walletbalance/:accountNumber",
  moniepointController.getWalletBalance
);
router.get("/allwallet", moniepointController.getAllWallet);

module.exports = router;
