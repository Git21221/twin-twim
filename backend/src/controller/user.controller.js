import { User } from "../model/user.model.js";
import { asyncFuncHandler } from "../utils/asyncFuncHandler.util.js";
import { apiErrorHandler } from "../utils/apiErrorHandler.util.js";
import { apiResponseHandler } from "../utils/apiResponseHandler.util.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessRefreshToken.util.js";
import {
  accessTokenOptions,
  refreshTokenOptions,
} from "../utils/refreshAccessToken.util.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

//controller for registering a user
const registerUser = asyncFuncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req?.body;

  //-----------sanitize inputs------------->
  if (!firstName || !lastName || !email || !password)
    return res
      .status(400)
      .json(new apiErrorHandler(400, "All fields are required"));
  //-----------sanitization done------------->

  //-----------validate inputs------------->
  //check if password is min 6 length
  if (typeof password !== "string" || password.length < 6)
    return res
      .status(400)
      .json(
        new apiErrorHandler(400, "Password must be atleast 6 characters long")
      );
  //check if password is max 20 length
  if (typeof password !== "string" || password.length > 20)
    return res
      .status(400)
      .json(
        new apiErrorHandler(400, "Password must be atmost 20 characters long")
      );
  //check if email is valid
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
    return res.status(400).json(new apiErrorHandler(400, "Invalid email"));

  //first name and last name should be string and 50 chars only
  if (typeof firstName !== "string" || firstName.length > 50)
    return res
      .status(400)
      .json(
        new apiErrorHandler(
          400,
          "First name should be string and 50 chars only"
        )
      );
  if (typeof lastName !== "string" || lastName.length > 50)
    return res
      .status(400)
      .json(
        new apiErrorHandler(400, "Last name should be string and 50 chars only")
      );
  //-----------validation done------------->

  //create a unique username (randomly generated)
  const username = `dev_${Math.floor(Math.random() * 1000000)}_${Date.now()}`;
  //check if user exists
  //check if email exists
  const existedUserEmail = await User.find({ email }, { new: true });

  if (existedUserEmail.length !== 0) {
    return res
      .status(401)
      .json(
        new apiErrorHandler(400, "User already exists with that email id!")
      );
  }
  //check if username exists
  const existedUsername = await User.find({ username }, { new: true });
  if (existedUsername.length !== 0) {
    return res
      .status(401)
      .json(
        new apiErrorHandler(400, "User already exists with that username!")
      );
  }
  //hash password
  // const hashedPassword = await bcrypt.hash(password, 10);
  //create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    username,
  });
  //check if user is created successfully
  if (!user)
    return res
      .status(500)
      .json(
        new apiErrorHandler(
          500,
          "User not created for some unknown internal reason!"
        )
      );
  //send response
  return res
    .status(201)
    .json(new apiResponseHandler(201, "User created successfully"));
});

//controller for login a user
const loginUser = asyncFuncHandler(async (req, res) => {
  const { emailOrUsername, password } = req?.body;
  //-----------sanitize inputs------------->
  if (!emailOrUsername || !password)
    return res
      .status(400)
      .json(new apiErrorHandler(400, "All fields are required"));
  //-----------sanitization done------------->
  //-----------validate inputs------------->
  //check if password is min 6 length
  if (typeof password !== "string" || password.length < 6)
    return res
      .status(400)
      .json(
        new apiErrorHandler(400, "Password must be atleast 6 characters long")
      );
  //check if password is max 20 length
  if (typeof password !== "string" || password.length > 20)
    return res
      .status(400)
      .json(
        new apiErrorHandler(400, "Password must be atmost 20 characters long")
      );
  let username = "";
  let email = "";
  //check if email or username is entered
  if (emailOrUsername.includes("@")) {
    email = emailOrUsername;
  } else {
    username = emailOrUsername;
  }
  const user = await User.findOne({
    $or: [
      {
        email,
      },
      { username },
    ],
  });

  if (!user)
    return res
      .status(401)
      .json(
        new apiErrorHandler(401, "User not found with that username or email")
      );
  //check if password matches
  const isPasswordMatched = await user.isPasswordCorrect(password);
  if (!isPasswordMatched)
    return res.status(401).json(new apiErrorHandler(401, "Invalid password"));
  //generate access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select("-password -_id"); //remove password and refresh token from response
  //send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new apiResponseHandler(200, "User logged in successfully", loggedInUser)
    );
});

const getUserProfile = asyncFuncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user)
    return res
      .status(404)
      .json(new apiErrorHandler(404, "User not found with that id"));
  return res.status(200).json(new apiResponseHandler(200, "User found", user));
});

const getOtherUserProfile = asyncFuncHandler(async (req, res) => {
  const user = await User.findById(req?.params?.userId).select("-password");
  if (!user)
    return res
      .status(404)
      .json(new apiErrorHandler(404, "User not found with that id"));
  return res.status(200).json(new apiResponseHandler(200, "User found", user));
});

const auth = asyncFuncHandler(async (req, res) => {
  const token = req?.cookies?.accessToken;
  console.log("token",token);
  //check if token is valid
  if (!token)
    return res.status(401).json(new apiErrorHandler(401, "Token required"));
  //verify token
  const userId = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
  //check if user exists
  if (!userId)
    return res.status(401).json(new apiErrorHandler(401, "Token not found"));
  const user = await User.findById(new mongoose.Types.ObjectId(userId._id));
  if (!user)
    return res.status(401).json(new apiErrorHandler(401, "Unauthorized"));
  //send response
  return res
    .status(200)
    .json(new apiResponseHandler(200, "User authenticated", user));
});

export { registerUser, loginUser, getUserProfile, getOtherUserProfile, auth };
