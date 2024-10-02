const Ride = require("../models/rideModel");
const Driver = require("../models/driverModel");
const Passenger = require("../models/passengerModel");
const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync");
// const { setTimeout } = require("timers/promises");
// const { time } = require("console");

// // GET ride start location

//  GET passenger most recent ride
exports.recentRide = catchAsync(async (req, res, next) => {
  const ride = await Ride.findOne({ passengerid: req.params.passengerid })
    .sort({ startTime: -1 })
    .limit(1);

  if (!ride) {
    return res.status(404).json({
      status: "fail",
      message: "Ride not found",
    });
  }

  res.status(200).json({
    status: "Data Found",
    data: {
      ride,
    },
  });
});

// exports.createRide = catchAsync(async (req, res, next) => {
//   const newRide = await Ride.create({
//     driverid: req.body.email,
//     driverLocation: req.body.userName,
//     passengerid: req.body.password,
//     passengerLocation: req.body.contact,
//     startLocation: passengerLocation,
//     endLocation: destination,
//     distance: Distance,
//   });

//   res.status(200).json({
//     status: "Success",
//     data: {
//       newRide,
//     },
//   });
// });

// // exports.isMoving = catchAsync(async (req, res, next) => {
// //   try {
// //     const { passengerLocation, driverLocation } = req.body;
// //     const rideId = req.params.id;

// //     // Input validation
// //     if (!passengerLocation || !driverLocation || !rideId) {
// //       return res
// //         .status(400)
// //         .json({ status: "error", message: "Missing required parameters" });
// //     }

// //     // console.log(passengerLocation);

// //     // Update the ride status
// //     const updatedRide = await updateRideStatus(
// //       passengerLocation,
// //       driverLocation,
// //       rideId
// //     );

// //     // Handle the result based on whether the ride was updated or not
// //     if (updatedRide) {
// //       res.status(200).json({ status: "success", ride: updatedRide });
// //     } else {
// //       res.status(200).json({
// //         status: "success",
// //         message: "Ride has not started yet or is already moving",
// //       });
// //     }
// //   } catch (error) {
// //     console.error("Error updating ride status:", error);
// //     res.status(500).json({ status: "error", message: "Internal server error" });
// //   }

// //   async function updateRideStatus(passengerLocation, driverLocation, rideId) {
// //     try {
// //       // console.log(passengerLocation);
// //       passengerLocation = String(passengerLocation);
// //       driverLocation = String(driverLocation);

// //       const [passengerLat, passengerLng] = passengerLocation.split(",");
// //       const [driverLat, driverLng] = driverLocation.split(",");

// //       // console.log(passengerLat);

// //       const distance = calculateDistance(
// //         passengerLat,
// //         passengerLng,
// //         driverLat,
// //         driverLng
// //       );
// //       console.log(distance);
// //       const thresholdDistance = 0.05;

// //       if (distance < thresholdDistance) {
// //         const ride = await Ride.findOneAndUpdate(
// //           { _id: rideId, status: "Waiting" },
// //           { status: "Moving" },
// //           { new: true }
// //         );
// //         return ride;
// //       }
// //       if (distance > thresholdDistance) {
// //         const ride = await Ride.findOneAndUpdate(
// //           { _id: rideId, status: "Moving" },
// //           { status: "Arrived" },
// //           { new: true }
// //         );
// //         return ride;
// //       } else {
// //         return null;
// //       }
// //     } catch (error) {
// //       console.error("Error updating ride status:", error);
// //       throw error;
// //     }
// //   }
// // });

// // function calculateDistance(lat1, lon1, lat2, lon2) {
// //   const R = 6371; // Radius of the Earth in kilometers
// //   const dLat = ((lat2 - lat1) * Math.PI) / 180;
// //   const dLon = ((lon2 - lon1) * Math.PI) / 180;
// //   const a =
// //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// //     Math.cos((lat1 * Math.PI) / 180) *
// //       Math.cos((lat2 * Math.PI) / 180) *
// //       Math.sin(dLon / 2) *
// //       Math.sin(dLon / 2);
// //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //   const distance = R * c;
// //   return distance;
// // }

// // exports.getDriversWithin = catchAsync(async (req, res, next) => {
// //   const { distance } = req.params;
// //   const { passengerLocation, driverLocation } = req.body;

// //   const [passengerLat, passengerLng] = passengerLocation.split(",");
// //   const [driverLat, driverLong] = driverLocation.split(",");

// //   // Latitude and Longitude values for both passenger.
// //   console.log("Passenger Latitude:", passengerLat);
// //   console.log("Passenger Longitude:", passengerLng);

// //   // const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

// //   if (!lat || !lng)
// //     next(
// //       new AppError(
// //         "Please provide latitude and longitude in the format lat, lng",
// //         400
// //       )
// //     );

// //   console.log(Number(distance), Number(lat), lng, unit);
// //   const drivers = await Driver.find({
// //     driverLocation: {
// //       $near: {
// //         $geometry: {
// //           type: "Point",
// //           coordinates: [passengerLat, passengerLng],
// //         },
// //         $maxDistance: distance,
// //       },
// //     },
// //   });
// //   // console.log(drivers);
// //   res.status(200).json({
// //     status: "success",
// //     //results: drivers.length,
// //     // data: {
// //     //   data: drivers,
// //     // },
// //   });
// // });

// // exports.getDistances = catchAsync(async (req, res, next) => {
// //   const { latlng, unit } = req.params;
// //   const [lat, lng] = latlng.split(",");

// //   const multiplier = unit === "mi" ? 0.000621371 : 0.001;

// //   if (!lat || !lng) {
// //     next(
// //       new AppError(
// //         "Please provide latitude and longitude in the format lat, lng",
// //         400
// //       )
// //     );
// //   }

// //   const distances = await Driver.aggregate([
// //     {
// //       $geoNear: {
// //         near: {
// //           type: "Point",
// //           coordinates: [lat * 1, lng * 1],
// //         },
// //         distanceField: "distance",
// //         distanceMultiplier: 0.001,
// //       },
// //     },
// //     // {
// //     //   $project: {
// //     //     distance: 1,
// //     //     name: 1,
// //     //   },
// //     // },
// //   ]);

// //   console.log(lat, lng);

// //   res.status(200).json({
// //     status: "success",
// //     data: {
// //       data: distances,
// //     },
// //   });
// // });

// // exports.isMoving = catchAsync(async (req, res, next) => {
// //   const { passengerLocation, driverLocation, time } = req.body;
// //   const rideId = req.params.id;

// //   // Function to update the ride status
// //   async function updateRideStatus(passengerLocation, driverLocation, rideId) {
// //     try {
// //       // Destructure latitude and longitude from passenger location object
// //       const { latitude: passengerLat, longitude: passengerLng } =
// //         passengerLocation;
// //       // Destructure latitude and longitude from driver location object
// //       const { latitude: driverLat, longitude: driverLng } = driverLocation;

// //       // Function to calculate distance between two points using Haversine formula
// //       function calculateDistance(lat1, lon1, lat2, lon2) {
// //         const R = 6371; // Radius of the Earth in kilometers
// //         const dLat = ((lat2 - lat1) * Math.PI) / 180; // Convert degrees to radians
// //         const dLon = ((lon2 - lon1) * Math.PI) / 180;
// //         const a =
// //           Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// //           Math.cos((lat1 * Math.PI) / 180) *
// //             Math.cos((lat2 * Math.PI) / 180) *
// //             Math.sin(dLon / 2) *
// //             Math.sin(dLon / 2);
// //         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //         const distance = R * c; // Distance in kilometers
// //         return distance;
// //       }

// //       // Calculate distance between passenger and driver
// //       const distance = calculateDistance(
// //         passengerLat,
// //         passengerLng,
// //         driverLat,
// //         driverLng
// //       );
// //       console.log(distance);
// //       const thresholdDistance = 0.005; // Threshold distance in kilometers

// //       if (distance < thresholdDistance) {
// //         // Update the ride status
// //         const ride = await Ride.findOneAndUpdate(
// //           { _id: rideId, moving: false }, // Find the appropriate ride by ID and status
// //           { moving: true }, // Update the ride status to indicate it's moving
// //           { new: true } // Return the updated ride
// //         );

// //         return ride;
// //       } else {
// //         return null; // Ride has not started yet
// //       }
// //     } catch (error) {
// //       console.error("Error updating ride status:", error);
// //       throw error; // Handle error appropriately
// //     }
// //   }

// //   // Call the updateRideStatus function with provided locations and ride ID
// //   const updatedRide = await updateRideStatus(
// //     passengerLocation,
// //     driverLocation,
// //     rideId
// //   );

// //   // Handle the result based on whether the ride was updated or not
// //   if (updatedRide) {
// //     res.status(200).json({ status: "success", ride: updatedRide });
// //   } else {
// //     res.status(200).json({
// //       status: "success",
// //       message: "Ride has not started yet or already moving",
// //     });
// //   }
// // });

// // // Assuming initialDistance is calculated before calling this function
// // // const distance = calculateInitialDistance(passengerid, driverid);

// // // Function to update the ride status after checking the distance again
// // async function updateRideStatusAfterInterval(passengerid, driverid, distance) {
// //   try {
// //     // Wait for 5 minutes (or any desired interval)
// //     await setTimeout(5 * 60 * 1000); // 5 minutes in milliseconds

// //     // Retrieve passenger's location from the database
// //     const passenger = await Passenger.findById(passengerid);
// //     const passengerLocation = passenger.locations.coordinates;

// //     // Retrieve driver's location from the database
// //     const driver = await Driver.findById(driverid);
// //     const driverLocation = driver.locations.coordinates;

// //     // Calculate distance between passenger and driver after the interval
// //     const currentDistance = calculateDistance(
// //       passengerLocation[1],
// //       passengerLocation[0], // Coordinates are stored in [longitude, latitude] format
// //       driverLocation[1],
// //       driverLocation[0]
// //     );

// //     // Threshold distance, assuming it remains the same
// //     const thresholdDistance = 0.1; // Threshold distance in kilometers

// //     if (currentDistance <= thresholdDistance && currentDistance <= distance) {
// //       // Update the ride status
// //       const ride = await Ride.findByIdAndUpdate(
// //         { _id: rideId, moving: false },
// //         { moving: true },
// //         { endTime: time },
// //         { new: true } // Return the updated ride
// //       );

// //       return ride;
// //     } else {
// //       return null; // Ride could not be started or distance increased beyond threshold
// //     }
// //   } catch (error) {
// //     console.error("Error updating ride status:", error);
// //     throw error; // Handle error appropriately
// //   }
// // }

// // Example usage
// // const passengerId = "65fb2db94232162e1093d80e";
// // const driverId = "65f9746ea67fef389459130c";

// // Assuming initialDistance is calculated before calling this function
// //   const initialDistance = calculateInitialDistance(passengerId, driverId);

// //   updateRideStatusAfterInterval(passengerId, driverId, initialDistance)
// //     .then((ride) => {
// //       if (ride) {
// //         console.log("Ride started:", ride);
// //       } else {
// //         console.log(
// //           "Ride could not be started or distance increased beyond threshold."
// //         );
// //       }
// //     })
// //     .catch((error) => {
// //       console.error("Error:", error);
// //     });
// // });
