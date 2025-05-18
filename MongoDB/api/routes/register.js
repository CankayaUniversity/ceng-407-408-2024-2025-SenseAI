const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../db/models/Users");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      throw new CustomError(
        400,
        "Validation Error!",
        "This email already been exist."
      );

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password,
    });

    await newUser.save();

    res.json(Response.successResponse({ success: true }));
    console.log("bu ksııma gieiyor musuun");
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
