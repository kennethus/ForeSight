const User = require("../models/UserModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

// Route: api/auth/register : Create new user
// Method: POST
// Request:
//   axios.post(`${import.meta.env.VITE_API_URL}api/auth/register`, {
//     name: 'John Kenneth Adolfo,
//     username: 'Kennethus',
//     email: 'jnadolfo@up.edu.ph',
//     password: 'samplePasword@123',
//     age: 23,
//     sex: 'Male',
//     balance: 2500
//   })
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     message: 'User created successfully'
//     data: {
//         _id,
//         name,
//         email,
//         token
//     }
//   }
const createUser = asyncHandler(async (req, res) => {
  try {
    const { name, username, email, password, age, sex, balance } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !username ||
      !age ||
      !sex ||
      balance < 0
    ) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      age,
      sex,
      balance,
    });

    const savedUser = await newUser.save();

    // Generate token and set cookie
    const token = generateToken(res, savedUser._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        token: token, // Return token
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating user",
        error: error.message,
      });
  }
});

// Route: api/auth/login : Login user
// Method: POST
// Request:
//   axios.post(`${import.meta.env.VITE_API_URL}api/auth/login`, {
//     email: 'user@example.com',
//     password: 'samplepassword@123'
//   })
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     message: 'User logged in successfully'
//     data: {
//         _id,
//         name,
//         email,
//         token
//     }
//   }
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate token and set cookie
      const token = generateToken(res, user._id);

      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          token: token,
          balance: user.balance,
        },
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error logging user",
        error: error.message,
      });
  }
});

// Route: api/auth/logout : Logout User
// Method: POST
// Request:
//   axios.post(
//    `${import.meta.env.VITE_API_URL}/api/auth/logout`,
//    {},
//    { withCredentials: true }
//   );
// Response:
//   {
//     success: /* true or false */
//     message: "Logged out successfully"
//   }
const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "None",
    secure: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Route: api/auth/me : Get current logged in User
// Method: GET
// Request:
//   axios.get(
//    `${import.meta.env.VITE_API_URL}/api/auth/me`,
//    { withCredentials: true }
//   );
// Response:
//   {
//     success: /* true or false */
//     user: {_id, name, email}
//   }
const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "User not logged in" });
  }

  res.status(200).json({
    success: true,
    user: {
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      balance: req.user.balance,
    },
  });
});

// Generate JWT Token
const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "12h", //Change to 1hr if for production
  });

  // Set cookie for authentication
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.IS_DEPLOYED === "true",
    sameSite: process.env.IS_DEPLOYED === "true" ? "none" : "lax",
    maxAge: 3600000, // 1 hr
  });

  return token;
};

module.exports = {
  loginUser,
  createUser,
  logoutUser,
  getCurrentUser,
};
