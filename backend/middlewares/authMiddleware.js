const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');

const authenticate = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.cookies?.token) {
        token = req.cookies.token;
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Log decoded user info
            // console.log("Decoded User: ", decoded);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
    } else {
        console.log("No token in cookies");
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
});

module.exports = { authenticate };
