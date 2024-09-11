const { Keypair, PublicKey } = require("@solana/web3.js");
const dotenv = require("dotenv");

const MERCHANT_WALLET = new PublicKey(
  "2Gz9ag48EayRrzEfXRkNWNLHxvSkXydLfM8TwzrV6iCY"
);

// const CUSTOMER_WALLET = Keypair.fromSecretKey(Uint8Array.from([]))

module.exports = {
  MERCHANT_WALLET,
  CUSTOMER_WALLET,
};
