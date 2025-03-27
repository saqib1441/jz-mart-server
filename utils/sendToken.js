import jwt from "jsonwebtoken";

const sendToken = (user, message, res) => {
  console.log(user);
  // Generate JWT token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "90d", // token expiration time
  });

  // Options for the cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevent client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Ensure cookie is sent over HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "LAX", // Control cross-site cookie sharing
    path: "/",
    maxAge: process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000, // Set cookie expiration based on the environment variable
  };

  // Send the token in the response as a cookie
  res.status(200).cookie("token", token, options).json({
    success: true,
    message,
    data: user,
  });
};

export default sendToken;
