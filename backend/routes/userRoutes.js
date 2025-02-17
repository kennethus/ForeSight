const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    deleteUser,
    updateUser
} = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware')

//PRIVATE ----------------------------------------
// Route for getting all users
router.get('/', authenticate, getUsers);

// Route for getting a single user by ID
router.get('/:id', authenticate, getUser);

// Route for deleting a user by ID
router.delete('/:id', authenticate, deleteUser);

// Route for updating a user by ID
router.patch('/:id', authenticate, updateUser);

module.exports = router;
