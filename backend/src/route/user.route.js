import { Router } from "express";
import { getUserProfile, loginUser, registerUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/me", verifyJWT, getUserProfile);