const express = require('express');
const connectDB = require('./config/database');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const { validateSignupData } = require('./utils/validation');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json()); // Middleware to parse incoming request with JSON payloads
app.use(cookieParser()); // Middleware to parse incoming request cookies

app.post("/signup", async (req, res) => {
    try{
        const { firstName, lastName, emailId, password } = req.body;
        // Validate the request data
        validateSignupData(req);

        // Encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Creating new instance of User model and storing the data in the database
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        });
        await user.save();
        res.send("User added successfully");
    } catch(err){
        res.status(400).send("Error in saving user " + err.message);
    }
})

app.post("/login", async (req, res) => {
    try{
        const {emailId, password} = req.body;
        if(!validator.isEmail(emailId)){
            throw new Error("Invalid email");
        }
        const user = await User.findOne({emailId : emailId});
        if(!user){
            throw new Error("Emails Id not present in Database");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(isPasswordValid){
            // Create JWT token
            const token = await jwt.sign({_id : user._id}, "DEV@Tinder$17");

            // Add the token to cookie and send the response back to the user
            res.cookie("token", token);

            res.send("Login successful");
        } 
        else{
            throw new Error('Password is incorrect');
        }

    } catch(err) { 
        res.status(400).send("Error " + err.message); 
    }
})

app.get("/profile", async (req, res) => {
    try{
        const cookies = req.cookies;
        const {token} = cookies;
        // Validate if the token is present in the cookies
        if(!token){
            throw new Error("Token not present in the cookies");
        }

        // Read the token and get the data (here _id) from the token
        const decodedMessage = await jwt.verify(token, "DEV@Tinder$17");
        const { _id }  = decodedMessage;

        // Fetch the user data from the database using the _id
        const user = await User.findById(_id);
        if(!user){
            throw new Error("User not found");
        }
        res.send(user);

    } catch(err){
        res.status(400).send('Error: ' + err.message);
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