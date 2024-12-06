const factory = require("./handlefactory");
const Trip = require("../models/tripModel");
const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.createNewRoute = factory.createOne(Trip);

exports.getAllRoute = factory.getAll(Trip);

exports.updateRoute = factory.updateOne(Trip);

exports.getRoute = catchAsync(async (req, res, next) => {
  const trip = await Trip.findOne(req.params.routeno);

  if (!trip) {
    return next(new AppError("No room with that number", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      trip,
    },
  });
});
