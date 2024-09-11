const DriverDetails = require("../models/driverKyc");
const catchAsync = require("./../utils/catchAsync");
const Driver = require("../models/driverModel");
const AppError = require("../utils/appError");
const factory = require("./handlefactory");

// Function to store all required Drivers details to the Database.
exports.createDriverDetails = catchAsync(async (req, res, next) => {
  const driverdetail = await DriverDetails.create(
    req.body
    // driverId = req.params.id
  );
  res.status(200).json({
    status: "Success",
    data: {
      driverdetail,
    },
  });
});

exports.getDriver = factory.getOne(Driver);

exports.getDriversWithin = catchAsync(async (req, res, next) => {
  const { distance, passengerLocation } = req.params;

  const [passengerLat, passengerLng] = passengerLocation.split(",");

  // Latitude and Longitude values for passenger.
  console.log("Passenger Latitude:", passengerLat);
  console.log("Passenger Longitude:", passengerLng);

  // const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!passengerLat || !passengerLng)
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng",
        400
      )
    );

  // console.log(Number(distance), Number(lat), lng, unit);
  const drivers = await Driver.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [passengerLat, passengerLng],
        },
        $maxDistance: distance,
      },
    },
  });
  if (drivers.length === 0) {
    return next(
      new AppError("No drivers found within the specified distance.", 404)
    );
  }
  // console.log(drivers);
  res.status(200).json({
    status: "success",
    results: drivers.length,
    data: {
      data: drivers,
    },
  });
});

exports.getDriversWithinRadius = catchAsync(async (req, res, next) => {
  const { distance, passengerLocation, unit } = req.params;
  const [lat, lng] = passengerLocation.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng",
        400
      )
    );

  console.log(distance, lat, lng, unit);
  const drivers = await Driver.find({
    locations: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: drivers.length,
    data: {
      data: drivers,
    },
  });
});
