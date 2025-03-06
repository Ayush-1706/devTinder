const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/auth');

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const {firstName, lastName} = req.user;
    console.log("logged in user is " + firstName + " " + lastName);
})

module.exports = requestRouter;