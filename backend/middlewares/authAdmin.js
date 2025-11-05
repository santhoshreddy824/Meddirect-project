import jwt from "jsonwebtoken";

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {

        const { atoken, aToken } = req.headers;
        const token = atoken || aToken; // Handle both variations
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        if (token_decode.email !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }

        next();

    } catch (error) {
        console.log("ADMIN AUTH ERROR:", error.message);
        res.json({ success: false, message: error.message });
    }
}

export default authAdmin