const express = require("express");
const protectedRoute = require('../middlewares/authMiddleware');
const contactUs = require("../controllers/contactUsController");
const router = express.Router();


router.post("/", protectedRoute, contactUs);

module.exports = router;