const express = require("express");
const tripController = require("./../controllers/tripController");

const router = express.Router();

router.post("/createroute", tripController.createNewRoute);
router.get("/allroutes", tripController.getAllRoute);
router.get("/:routeno", tripController.getRoute);
router.patch("/updateroute/:id", tripController.updateRoute);

module.exports = router;
