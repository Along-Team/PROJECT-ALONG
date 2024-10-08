const {
  encodeURL,
  findReference,
  FindReferenceError,
  ValidateTransfer,
} = require("@solana/pay");
const { BigNumber } = require("bignumber.js");
const catchAsync = require("../utils/catchAsync");
const { Keypair, PublicKey } = require("@solana/web3.js");
const MERCHANT_WALLET = require("../solana-pay/constants");
// const MERCHANT_WALLET = "2Gz9ag48EayRrzEfXRkNWNLHxvSkXydLfM8TwzrV6iCY";
const { establishConnection } = require("../solana-pay/establish-connection");

exports.initPay = catchAsync((req, res) => {
  try {
    const { amount, label, message, memo } = req.body;
    if (!amount || !label || !message || !memo) {
      res.status(400).send({ message: "Invalid payment request info" });
      return;
    }
    let reference = new Keypair().publicKey;
    let parsedNumber = new BigNumber(amount);
    console.log(" Create a Payment Requeest Link");
    const url = encodeURL({
      recipient: MERCHANT_WALLET.toBase58(),
      parsedNumber,
      label,
      message,
      memo,
      reference: reference.toBase58({ url, reference }),
    });
    res.status(200).send();
  } catch (error) {
    console.log(error);
  }
  res.status(400).send({ message: error.message });
});

exports.checkTransactionStatus = catchAsync(async (req, res) => {
  const connection = await establishConnection();
  const { amount, reference } = req.body;
  if (!amount || reference) {
    res.status(400).send("Invalid Info, Check payment amount or reference");
  }
  let parsedAmount = new BigNumber(amount);
  let pubKey = new PublicKey(reference);

  try {
    const { signature } = await findReference(connection, pubKey, {
      finality: "confirmed",
    });
    console.log("/n Signature: ", signature.signature);

    if (signature) {
      let transactionResponds = await ValidateTransfer({
        connection,
        signature,
        recipient: MERCHANT_WALLET,
      });
      let paymentStatus = "Validated";
      if (transactionResponds) {
        console.log("Payment : ", paymentStatus);
        res.status(200).send({
          fee: transactionResponds.meta.fee,
          blockTime: transactionResponds.blockTime,
          signatures: transactionResponds.signatures,
          message: "Transaction Succesful",
        });
      } else {
        paymentStatus = "Invalid";
        console.log("Payment : ", paymentStatus);
        res.status(400).send({ message: "Transaction Failed" });
      }
    }
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});
