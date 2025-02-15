const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    loginUser,
    logoutUser
} = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware')

//Public routes --------------------------------

// Route for logging User
router.post('/auth/login', loginUser);
// Route for logging out User
router.post('/auth/logout', logoutUser);
// Route for creating/registering a new user
router.post('/auth/register', createUser);


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
