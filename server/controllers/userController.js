import userModel from "../models/user.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const setGarageOwnerMetadata = async (req, res) => {
  try {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      return res.json({
        success: false,
        message: "Clerk user ID is required",
      });
    }

    const response = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: {
            userType: "garageOwner",
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.json({
        success: false,
        message: "Failed to update user metadata",
        error,
      });
    }

    const updatedUser = await response.json();
    res.json({
      success: true,
      message: "Garage owner metadata set successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, setGarageOwnerMetadata };
