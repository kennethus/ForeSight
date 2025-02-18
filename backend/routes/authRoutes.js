const express = require('express');
const router = express.Router();
const {
    createUser,
    loginUser,
    logoutUser,
    getCurrentUser
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware')

//Public routes --------------------------------

// Route for logging User
router.post('/login', loginUser);
// Route for logging out User
router.post('/logout', logoutUser);
// Route for creating/registering a new user
router.post('/register', createUser);
router.get("/me", authenticate, getCurrentUser); // ✅ Auth check route




module.exports = router;
