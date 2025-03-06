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
        res.status(400).send("Error in saving user " + err.message);
    }
})

// Get user by email
app.get("/user", async (req, res) => {
    try{
        const userEmail = req.body.emailId;
        const users = await User.find({emailId: userEmail});
        if(users.length === 0){
            res.status(400).send("User not found");
        }
        res.send(users);
    } catch(err){
        res.status(400).send("Something went wrong");
    }
})

// feed api - Fetch all the users from the database
app.get("/feed", async (req, res) => {
    try{
        const users = await User.find({});
        res.send(users);

    } catch(err){
        res.status(400).send("Something went wrong");
    }
})

// delete api - Delete user by id
app.delete("/user", async (req, res) => {
    try{
        const userId = req.body.userId;
        const user = await User.findByIdAndDelete(userId); // shorthand notation for (_id: userId)
        res.send("User deleted successfully");
    } catch(err){
        res.status(400).send("Something went wrong");
    }
})

// /update - Update user data
app.patch("/user/:userId", async (req, res) => {
    try{
        const userId = req?.params?.userId;
        const data = req.body;

        const ALLOWED_FIELDS_FOR_UPDATE = ["photoUrl", "about", "skills"];
        const isUpdateAllowed = Object.keys(data).every((fields) => ALLOWED_FIELDS_FOR_UPDATE.includes(fields));
        if(!isUpdateAllowed){
            throw new Error("Update for the field(s) is not allowed");
        }
        if(data.skills.length > 10){
            throw new Error("Skills should not exceed 10");
        }
        const user = await User.findByIdAndUpdate(userId, data, {           // 3rd argument is options
            returnDocument: "after",
            runValidators: true                                             // enable validation
        });
        res.send("User updated successfully");
    } catch(err){
        res.status(400).send('Update failed: ' + err.message);
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