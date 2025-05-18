const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../db/models/Users");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      throw new CustomError(400, "Validation Error!", "No such user found");

    // const isMatch = await bcrypt.compare(password, user.password);
    if (password !== user.password)
      throw new CustomError(
        400,
        "Validation Error!",
        "The password is incorrect."
      );

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
