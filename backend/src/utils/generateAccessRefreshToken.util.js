import { User } from "../model/user.model.js";
import { apiErrorHandler } from "./apiErrorHandler.util.js";

const generateAccessAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    if (!accessToken || !refreshToken)
      throw new apiErrorHandler(400, "Error in rerfresh or access Token");

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiErrorHandler(
      400,
      "Internal error while generating access and refresh token!"
    );
  }
};

export { generateAccessAndRefreshToken };