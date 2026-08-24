import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

export const generateRefreshToken = (user, rememberMe) => {
  return jwt.sign(
    {
      id: user._id.toString(),
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: rememberMe ? "30d" : "3d",
    }
  );
};