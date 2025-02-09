require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const transactionsRoutes = require('./routes/transactionRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const budgetRoutes = require('./routes/budgetRoutes.js')
const goalRoutes = require('./routes/goalRoutes.js')

const app = express()

//middleware
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//routes
app.use('/transactions', transactionsRoutes);
app.use('/users', userRoutes);
app.use('/budgets', budgetRoutes);
app.use('/goals', goalRoutes)

//connect db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT, () => {
            console.log('connected on db and listening on port ', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    });


