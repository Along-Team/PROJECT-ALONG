const { cluseterApiUrl, Connection } = require("@solana/web3.js");

async function establishConnection(cluster = "devnet") {
  const endpoint = cluseterApiUrl(cluster);
  const connection = new Connection(endpoint, "confirmed");
  const version = await connection.getVersion();
  console.log("Connection to cluster established:", endpoint, version);

  return connection;
}
module.exports = { establishConnection };
