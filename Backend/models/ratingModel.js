const mongoose = require("mongoose");
const Driver = require("./driverModel");
const Passenger = require("./passengerModel");
//const slugify = require('slugify');

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
  // To visualize properties that are not stored in the DB but are calculated using some other values when it has an output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ driver: 1, passenger: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: "passenger",
    select: "name",
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (driverId) {
  //console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { driver: driverId },
    },
    {
      $group: {
        _id: "$driver",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Driver.findByIdAndUpdate(driverId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Driver.findByIdAndUpdate(driverId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // this mints to current review
  this.constructor.calcAverageRatings(this.driver);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query already executed
  await this.r.constructor.calcAverageRatings(this.r.driver);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
