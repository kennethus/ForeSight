const User = require('../models/UserModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching all users', error: error.message });
    }
};

// Get single user
const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid User ID" });
        }
    
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
    }
};

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



// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
    
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(400).json({ error: "No such user" });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
    
        const updatedUser = await User.findByIdAndUpdate({_id: id}, {
            ...req.body
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
    }
};

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
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    loginUser,
    logoutUser
};
