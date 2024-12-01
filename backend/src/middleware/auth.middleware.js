import { User } from "../model/user.model.js";
import { apiErrorHandler } from "../utils/apiErrorHandler.util.js";
import { asyncFuncHandler } from "../utils/asyncFuncHandler.util.js";
import { refreshAccessToken } from "../utils/refreshAccessToken.util.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncFuncHandler(async (req, res, next) => {
  try {
    let token;
    if (req?.cookies?.accessToken) {
      token = req?.cookies?.accessToken;
    } else if (req?.cookies?.refreshToken) {
      token = req?.cookies?.refreshToken;
      const { accessToken, refreshToken } = await refreshAccessToken(req, res);
      token = accessToken;
    }
    if (!token)
      return res
        .status(403)
        .json(new apiErrorHandler(403, "Token expired! try logging in again"));
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");
    if (!user)
      return res
        .status(404)
        .json(new apiErrorHandler(404, "User not found! Try logging in again"));
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(new apiErrorHandler(401, "Unauthorized"));
  }
});

export { verifyJWT };
