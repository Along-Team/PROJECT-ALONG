const axios = require("axios");
const Moniepay = require("../models/moniepointModel");
const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const apiService = require("../utils/monnifyAccess");

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

require("dotenv").config();

this.baseUrl = process.env.BASE_URL;
this.apiKey = process.env.API_KEY;
this.secretKey = process.env.SECRET_KEY;

exports.createWallet = catchAsync(async (req, res, next) => {
  try {
    // Fetch token
    let token = await apiService.getToken();
    if (!token) {
      return next(
        new AppError("Authentication failed: No token received", 401)
      );
    }

    // console.log("Token received:", token);

    // Send POST request to Monnify API
    const externalApiResponse = await axios.post(
      "https://sandbox.monnify.com/api/v1/disbursements/wallet",
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Save response in the database
    const moniepay = await Moniepay.create({
      apiResponse: externalApiResponse.data,
    });

    console.log("API Response:", externalApiResponse.data);

    res.status(201).json({
      status: "success",
      data: {
        data: moniepay,
      },
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return next(new AppError("Failed to create wallet", 500));
  }
});

exports.getWalletBalance = catchAsync(async (req, res, next) => {
  try {
    // Fetch token
    let token = await apiService.getToken();
    if (!token) {
      return next(
        new AppError("Authentication failed: No token received", 401)
      );
    }

    console.log("Token received:", token);

    console.log(req.params.accountNumber);

    // Send GET request to the external API to obtain te wallet balance
    const externalApiResponse = await axios.get(
      "https://sandbox.monnify.com/api/v1/disbursements/wallet",
      {
        params: { accountNumber: req.params.accountNumber },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.status(200).json({
      success: true,
      data: externalApiResponse.data,
    });
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return next(new AppError("Failed to get wallet balance", 500));
  }
});

exports.getAllWallet = catchAsync(async (req, res, next) => {
  try {
    // Fetch token
    let token = await apiService.getToken();
    if (!token) {
      return next(
        new AppError("Authentication failed: No token received", 401)
      );
    }

    // Send GET request to the external API to fetch all wallets
    const apiUrl = `${this.baseUrl}/api/v1/disbursements/wallet`;

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Assuming the data you want to send is in response.data
    const walletData = response.data;

    // Process the data if needed

    // Send the data as the response
    res.status(200).json(walletData);
  } catch (error) {
    console.error("Error getting all wallets:", error);
    return next(new AppError("Failed to get all wallets", 500));
  }
});

// exports.createWallet = catchAsync(async (req, res, next) => {
//   // Send POST request to the external API
//   let token = await apiService.getToken();
//   console.log(token);

//   const externalApiResponse = await axios.post(
//     "https://sandbox.monnify.com/api/v1/disbursements/wallet",
//     req.body,
//     { headers: { Authorization: `Bearer ${token}` } }
//   );

//   // Save the response in the database
//   const moniepay = await Moniepay.create({
//     apiResponse: externalApiResponse.data,
//   });
//   // const moniepay = await Moniepay.create(req.body);
//   console.log(externalApiResponse.data);
//   res.status(201).json({
//     status: "success",
//     data: {
//       data: moniepay,
//     },
//   });
// });
