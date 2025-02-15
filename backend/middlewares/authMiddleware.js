const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/UserModel')

const authenticate = asyncHandler(async (req, res, next) => {
    let token

    if(req.headers.authorization?.startsWith('Bearer ')){
        try {

            //get token from header
            token = req.headers.authorization.split(' ')[1]

            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            //Get user from token
            req.user = await User.findById(decoded.id).select('-password')
            next()

        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized" });

        }
    }

    if(!token){
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
})

module.exports = {authenticate}