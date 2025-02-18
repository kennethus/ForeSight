const User = require('../models/UserModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// 🔹 Create new user
const createUser = asyncHandler(async (req, res) => {
    try {
        const { name, username, email, password, age, sex, balance } = req.body;

        if (!name || !email || !password || !username || !age || !sex || !balance) {
            return res.status(400).json({ error: "Required fields are missing" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // 🔹 Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            age,
            sex,
            balance
        });

        const savedUser = await newUser.save();

        // 🔹 Generate token and set cookie
        const token = generateToken(res, savedUser._id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                token: token // ✅ Return token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
});

// 🔹 Login user
const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // 🔹 Generate token and set cookie
            const token = generateToken(res, user._id);

            res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    token: token
                }
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging user', error: error.message });
    }
});

// 🔹 Logout user
const logoutUser = async (req, res) => {
    res.cookie('token', '', { // ✅ Expire cookie
        httpOnly: true,
        expires: new Date(0),
    });
    
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// 🔹 Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    res.status(200).json({
        success: true,
        user: {
            _id: req.user.id,
            name: req.user.name,
            email: req.user.email,
        },
    });
});

// 🔹 Generate JWT Token
const generateToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    // 🔹 Set cookie for authentication
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.IS_DEPLOYED === 'true',
        sameSite: process.env.IS_DEPLOYED === 'true' ? 'none' : 'strict', 
        maxAge: 3600000 // 1 hr
    });

    return token;
};

module.exports = {
    loginUser,
    createUser,
    logoutUser,
    getCurrentUser
};
