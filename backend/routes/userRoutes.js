const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
} = require('../controllers/userController');

// Route for getting all users
router.get('/', getUsers);

// Route for getting a single user by ID
router.get('/:id', getUser);

// Route for creating a new user
router.post('/', createUser);

// Route for deleting a user by ID
router.delete('/:id', deleteUser);

// Route for updating a user by ID
router.patch('/:id', updateUser);

module.exports = router;
