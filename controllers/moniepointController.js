const axios = require("axios");
const Moniepay = require("../models/moniepointModel");
const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.createWallet = catchAsync(async (req, res, next) => {
  // Send POST request to the external API
  const externalApiResponse = await axios.post(
    "https://sandbox.monnify.com/api/v1/disbursements/wallet",
    req.body
  );

  // Save the response in the database
  const moniepay = await Moniepay.create({
    apiResponse: externalApiResponse.data,
  });
  // const moniepay = await Moniepay.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: moniepay,
    },
  });
});
