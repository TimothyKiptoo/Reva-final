const express = require("express");
const controller = require("../controllers/systemController");

const router = express.Router();

router.get("/capabilities", controller.getCapabilities);
router.get("/health", controller.getHealth);
router.get("/events", controller.streamEvents);

module.exports = router;
