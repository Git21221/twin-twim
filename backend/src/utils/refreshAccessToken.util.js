import { User } from "../model/user.model.js";
import { generateAccessAndRefreshToken } from "./generateAccessRefreshToken.util.js";

export const accessTokenOptions = {
  maxAge: 24 * 60 * 60 * 1000, // 1 day validity
  httpOnly: false,
  secure: true,
  sameSite: "None",
  path: "/",
};
export const refreshTokenOptions = {
  maxAge: 1 * 30 * 24 * 60 * 60 * 1000, //1 month validity
  httpOnly: false,
  secure: true,
  sameSite: "None",
  path: "/",
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req?.cookies?.refreshToken;
  if (!incomingRefreshToken)
    return res
      .status(401)
      .json({ message: "Unauthorized access, please login again" });
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  const userId = decodedToken._id;
  const user = await User.findById(userId);
  if (!user)
    return res
      .status(401)
      .json({ message: "Id do not match, please login again" });
  if (incomingRefreshToken !== user.refreshToken)
    return res
      .status(401)
      .json({ message: "Invalid refresh token, doesn't match with user" });
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userId
  );
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
  console.log("rat", accessToken, refreshToken);
  return { accessToken, refreshToken };
};

export { refreshAccessToken };
