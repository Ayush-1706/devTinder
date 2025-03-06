const express = require('express');
const authRouter = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');
const { validateSignupData } = require('../utils/validation');
const User = require('../models/user');

authRouter.post("/signup", async (req, res) => {
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

authRouter.post("/login", async (req, res) => {
    try{
        const {emailId, password} = req.body;
        if(!validator.isEmail(emailId)){
            throw new Error("Invalid email");
        }
        const user = await User.findOne({emailId : emailId});
        if(!user){
            throw new Error("Emails Id not present in Database");
        }
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){
            // Create JWT token
            const token = await user.getJWTToken();

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

authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })

    res.send("Logged out successfully");
})

module.exports = authRouter;