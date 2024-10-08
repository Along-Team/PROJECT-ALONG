const express = require("express");
const router = express.Router();
const SolanaPay = require("../controllers/solanaPayController");

router.post("/generate-pay-qr", SolanaPay.initPay);
router.post("/verify-payment", SolanaPay.checkTransactionStatus);

module.exports = router;
