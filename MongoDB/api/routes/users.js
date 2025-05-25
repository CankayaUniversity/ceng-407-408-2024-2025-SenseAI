const express = require("express");
const router = express.Router();
const User = require("../db/models/Users");
const Response = require("../lib/Response");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(Response.successResponse(users));
  } catch (err) {
    res.status(500).json(Response.errorResponse(err));
  }
});

module.exports = router;
