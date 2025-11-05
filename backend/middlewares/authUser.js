import jwt from "jsonwebtoken";

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    console.log("🔐 Auth check - Token received:", token ? "Yes" : "No");
    
    if (!token) {
      console.log("❌ No token provided");
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.log("❌ JWT_SECRET not configured");
      return res.json({
        success: false,
        message: "Server configuration error",
      });
    }

    console.log("🔍 Attempting to verify token...");
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified for user:", token_decode.id);
    
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log("❌ AUTH ERROR:", error.message);
    console.log("Token that failed:", req.headers.token?.substring(0, 20) + "...");
    
    // Provide more specific error messages
    let errorMessage = "Authentication failed";
    if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token format";
    } else if (error.name === "TokenExpiredError") {
      errorMessage = "Token has expired";
    } else if (error.message.includes("jwt malformed")) {
      errorMessage = "Invalid token - please login again";
    }
    
    res.json({ success: false, message: errorMessage });
  }
};

export default authUser;
