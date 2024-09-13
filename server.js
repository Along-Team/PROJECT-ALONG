const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log("UNHANDLED EXCEPTION");
  console.log(err.name, err.message);
  // server.close(() => {
  process.exit(1);
  //})
});

dotenv.config({ path: "./config.env" });

// console.log(process.env);

const { app, server } = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connection successful!");
  });

const port = process.env.PORT || 3001;
server.listen(port, "0.0.0.0", () => {
  console.log(`App running at http://0.0.0.0:${port}.... `);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
