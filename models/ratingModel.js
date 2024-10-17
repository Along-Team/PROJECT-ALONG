const mongoose = require("mongoose");
const Driver = require("./driverModel");
const Passenger = require("./passengerModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A tour must have a name"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    driver: {
      type: mongoose.Schema.ObjectId,
      ref: "Driver",
      required: [true, "Review must be for a Driver"],
    },
    passenger: {
      type: mongoose.Schema.ObjectId,
      ref: "Passenger",
      required: [true, "Review must belong to a Passenger"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ driver: 1, passenger: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "passenger",
    select: "name",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (driverId) {
  const stats = await this.aggregate([
    {
      $match: { driver: driverId },
    },
    {
      $group: {
        _id: "$driver",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        nRating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        nRating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        nRating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        nRating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        nRating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
      },
    },
  ]);

  if (stats.length > 0) {
    await Driver.findByIdAndUpdate(driverId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
      ratingsCount: {
        5: stats[0].nRating5,
        4: stats[0].nRating4,
        3: stats[0].nRating3,
        2: stats[0].nRating2,
        1: stats[0].nRating1,
      },
    });
  } else {
    await Driver.findByIdAndUpdate(driverId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
      ratingsCount: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.driver);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.driver);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
