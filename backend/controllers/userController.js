const User = require('../models/UserModel');
const mongoose = require('mongoose');

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
const createUser = async (req, res) => {
    try {
        const { name, username, email, password, age, sex, balance } = req.body;

        if (!name || !email || !password || !username || !age || !sex || !balance) {
            return res.status(400).json({ error: "Required fields are missing" });
        }
    
        const newUser = new User({
            name,
            username,
            email,
            password,
            age,
            sex,
            balance
        });

        const savedUser = await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully', data: savedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
};

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

module.exports = {
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
};
