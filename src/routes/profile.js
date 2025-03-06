const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const { validateEditProfileData, validateEditPassword } = require('../utils/validation'); 

// View profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try{
        const user = req.user;
        res.send(user);
    } catch(err){
        res.status(400).send('Error: ' + err.message);
    }
})

// Edit profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid fields for update");
        }

        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        })

        await loggedInUser.save();
        res.send(`${loggedInUser.firstName} updated successfully`);
    } catch(err){
        res.status(400).send('Unable to update: ' + err.message);
    }
})

// Password change
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try{
        if(!validateEditPassword(req)){
            throw new Error("Password is not strong");
        }

        const loggedInUser = req.user;
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        loggedInUser.password = passwordHash;

        await loggedInUser.save();
        res.send(`${loggedInUser.firstName}, your password has been updated successfully`);
    } catch(err){
        res.status(400).send('Unable to update: ' + err.message);
    }
})

module.exports = profileRouter;