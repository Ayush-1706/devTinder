const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

app.use(express.json()); // Middleware to parse incoming requrest with JSON payloads

app.post("/signup", async (req, res) => {
    
   // Creating new instance of User model
   const user = new User(req.body);

    try{
        await user.save();
        res.send("User added successfully");
    } catch(err){
        res.status(400).send("Error in saving user", err);
    }
})

connectDB()
    .then(() => {
        console.log('Database connected');
        app.listen(7777, () => {
            console.log('Server is running on port 7777');
        });
    }).catch((err) => {
        console.error("Error connecting database", err)
    })