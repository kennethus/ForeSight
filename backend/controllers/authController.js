const User = require('../models/UserModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');


// Create new user
const createUser = asyncHandler(async (req, res) => {
    try {
        const { name, username, email, password, age, sex, balance } = req.body;

        if (!name || !email || !password || !username || !age || !sex || !balance) {
            return res.status(400).json({ error: "Required fields are missing" });
        }

        const userExists = await User.findOne({email})

        if (userExists){
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        //Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
    
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

        //TO DO: the response should not include password
        res.status(201).json({ 
            success: true, 
            message: 'User created successfully', 
            data: {
                _id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                token: generateToken(savedUser._id)
            } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
});

// Create new user
const loginUser = asyncHandler(async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})

        if(user && (await bcrypt.compare(password, user.password))){
            //TO DO: the response should not include password
            res.status(200).json({ 
                success: true, 
                message: 'User login successfully', 
                data: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(res, user._id)
                }});
        } else {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging user', error: error.message });
    }
});

const logoutUser = async (req, res) => {
    res.clearCookie('token')
    res.status(200).json({ success: true, message: "Logout successfully" });

}

//Generate JWT
const generateToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET,{
        expiresIn: '1h'
    })

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.IS_DEPLOYED === 'true',
        sameSite: process.env.IS_DEPLOYED === 'true' ? 'none' : 'strict', // Set to 'none' for cross-site requests over HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    return token
}

module.exports = {
    loginUser,
    createUser,
    logoutUser
};