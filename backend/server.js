require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Import cookie-parser

const transactionsRoutes = require("./routes/transactionRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const budgetRoutes = require("./routes/budgetRoutes.js");
const goalRoutes = require("./routes/goalRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const transactionBudgetRoutes = require("./routes/transactionBudgetRoutes.js");
const featureRoutes = require("./routes/featureRoutes.js");
const forecastRoutes = require("./routes/forecastRoutes.js");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://fore-sight-eight.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//middleware
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/transaction-budget", transactionBudgetRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/forecast/", forecastRoutes);

//connect db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    //listen for requests
    app.listen(process.env.PORT, () => {
      console.log("connected on db and listening on port ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
