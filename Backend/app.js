const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const driverRouter = require("./routes/driverRoutes");
const passengerRouter = require("./routes/passengerRoutes");
const rideRouter = require("./routes/rideRoutes");
const ratingRouter = require("./routes/ratingRoutes");
// const http = require("http");
// const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against xss
app.use(xss());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

app.use(express.json());

//ROUTES
app.get("/api/welcome", (req, res) => {
  res.status(200).send({ message: "WELCOME TO ALONG APP API😁" });
});

app.use("/api/v1/passengers", passengerRouter);
app.use("/api/v1/drivers", driverRouter);
app.use("/api/v1/rides", rideRouter);
app.use("/api/v1/rating", ratingRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// Socket.io Setup
const UsersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};

const ActiveRidesState = {
  rides: [],
  setRides: function (newRidesArray) {
    this.rides = newRidesArray;
  },
};

// WebSocket setup
io.on("connection", (socket) => {
  socket.on("driver", (driverlocation) => {
    console.log(driverlocation);
  });

  socket.on("go-live", (data) => {
    const { name, type, userId, location, destination, plateno } = data;
    activateUser(socket.id, name, type, userId, location, destination, plateno);
    console.log(data);
  });

  socket.on("ready", () => {
    const user = getUser(socket.id);

    if (user) {
      io.to(socket.id).emit("status", {
        data: user,
      });
    }
  });

  socket.on("accept", (data) => {
    const { riderId } = data;

    //  set active ride
    const ride = updateRide({
      driverId: socket.id,
      riderId,
      rideStatus: "accepted",
    });

    // Generate a unique identifier for the ride, e.g., a combination of driver and rider IDs
    const rideId = `${ride.driverId}-${ride.riderId}`;
    socket.join(rideId); // Driver joins the ride room
    io.to(riderId).socketsJoin(rideId); // Rider joins the same ride room

    // Then, emit an event to this room whenever there are updates to this ride
    io.to(rideId).emit("rideUpdate", { ride });

    console.log(ride);
  });

  /**
   *  Passenger Events
   */
  // This event listens for a rider to request active drivers
  socket.on("find-drivers", ({ lat: passengerLat, lon: passengerLon }) => {
    console.log(UsersState.users);
    // get all drivers
    const drivers = UsersState.users.filter(
      (user) => user.userType === "drivers" && user.location
    );

    drivers.forEach((driver) => {
      const { lat: driverLat, lng: driverLon } = driver.location;
      console.log(driverLat, driverLon, passengerLat, passengerLon);
      const distance = calculateDistance(
        driverLat,
        driverLon,
        passengerLat,
        passengerLon
      );
      console.log(
        `Driver ${driver.name} is ${distance} units away from the passenger.`
      );
    });

    // send drivers to rider
    io.to(socket.id).emit("drivers", {
      drivers,
    });
  });

  socket.on("update-ride", (data) => {
    const { driverId, location } = data; // Assuming location is { lat, lng }

    // Fetch the ride associated with the driver
    let ride = ActiveRidesState.rides.find(
      (ride) => ride.driverId === driverId
    );
    if (!ride) return; // Handle case where ride is not found

    // Assuming the riderDestination is in the form { lat, lng }
    const riderDestination = ride.riderDestination;

    // Calculate distance to the destination
    const distanceToDestination = calculateDistance(
      location.lat,
      location.lng,
      riderDestination.lat,
      riderDestination.lng
    );

    let status;
    if (distanceToDestination < 0.05) {
      // Threshold for arrival
      status = "arrived";
    } else if (distanceToDestination < 5) {
      // Assuming 5 km is close enough to consider "moving to destination"
      status = "moving to destination";
    } else {
      status = "en route";
    }

    // Update the ride status
    ride = { ...ride, status };

    // Broadcast updated status
    const rideId = `${driverId}-${ride.riderId}`;
    io.to(rideId).emit("ride-status-updated", { ride });
  });
});

// User functions
function activateUser(
  id,
  name,
  userType,
  userId,
  location,
  destination,
  plateno
) {
  const user = { id, name, userType, userId, location, destination, plateno };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}

module.exports = { app, server };
