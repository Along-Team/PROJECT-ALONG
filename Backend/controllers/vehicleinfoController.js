const Vehicle = require("../models/vehicleinfoModel");
const factory = require("./handlefactory");
const catchAsync = require("./../utils/catchAsync");

exports.createVehicleInfo = factory.createOne(Vehicle); // For imporvement enable the route to get the driver id
// of the logged in driver and pass it to the request body to create a relation between vehicle and driver

// exports.updateVehicleInfo = factory.updateOne(Vehicle);

exports.updateVehicleInfo = catchAsync(async (req, res, next) => {
  const doc = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  console.log(doc);

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
