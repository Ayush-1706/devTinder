const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

app.post("/signup", async (req, res) => {
    const user = new User({
        firstName: "Sachin",
        lastName: "Tendulkar",
        emailId: "sachin@gmal.com",
        password: "sachin"
    });

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