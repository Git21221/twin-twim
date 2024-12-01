import { Router } from "express";
import { getOtherUserProfile, getUserProfile, loginUser, registerUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/me", verifyJWT, getUserProfile);
userRoutes.get("/user/:userId", verifyJWT, getOtherUserProfile);