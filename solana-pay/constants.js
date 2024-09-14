const { Keypair, PublicKey } = require("@solana/web3.js");
const dotenv = require("dotenv");

dotenv.config();

const MERCHANT_WALLET = new PublicKey(process.env.MERCHANT_WALLET_PUBLIC_KEY);

// const CUSTOMER_WALLET = Keypair.fromSecretKey(Uint8Array.from([]))
module.exports = {
  MERCHANT_WALLET,
  // CUSTOMER_WALLET,
};
