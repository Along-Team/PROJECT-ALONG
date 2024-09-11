const Review = require("../models/ratingModel");
const factory = require("./handlefactory");

exports.setTourUserIds = (req, res, next) => {
  // Allow nested route
  if (!req.body.driver) req.body.driver = req.params.driverId;
  if (!req.body.passenger) req.body.passenger = req.passenger.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReviews = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
