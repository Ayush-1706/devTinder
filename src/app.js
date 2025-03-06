const express = require('express');
const connectDB = require('./config/database');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const { validateSignupData } = require('./utils/validation');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middlewares/auth');

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
            const token = await jwt.sign({_id : user._id}, "DEV@Tinder$17", {expiresIn: "1d"});

            // Add the token to cookie and send the response back to the user
            res.cookie("token", token, 
                {
                    expires: new Date(Date.now() + 8*3600000)           // cookie will expire in 8 hrs
                }
            );

            res.send("Login successful");
        } 
        else{
            throw new Error('Password is incorrect');
        }

    } catch(err) { 
        res.status(400).send("Error " + err.message); 
    }
})

app.get("/profile", userAuth, async (req, res) => {
    try{
        const user = req.user;
        res.send(user);

    } catch(err){
        res.status(400).send('Error: ' + err.message);
    }
})

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    console.log(req.body)
    const {emailId} = req.body;
    console.log("logged in user is " + emailId);
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