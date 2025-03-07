const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');

const USER_SAFE_DATA = 'firstName lastName gender photoUrl about skills'
// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        // toUserId should be of of loggedIn user
        // Status should be interested
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName"]);

        if(!connectionRequest){
            return res.status(400).json({message: "No data"})
        }

        res.json({message: "Data fetched successfully", data:connectionRequest});

    } catch(err){
        res.status(400).send("Error in fetching all pending request: " + err.message);
    }
})


// Get all the connections of the loggedIn user
userRouter.get("/user/connection", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        // Condition 1 - Status should be accepted
        // Condition 2 - LoggedIn user should be either having toUserId or fromUserId 
        // #Example: Ayush sent request to Virat and Virat accepted & Virat sent request to Rishabh and Rishabh accepted, then Virat has in total 2 connections

        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUser: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        // Filtering the loggedIn user data and sending only the data of connections
        const data = connectionRequest.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){ // Using toString() since we are comparing two ObjectIds
                return row.toUserId;
            }
            else {
                return row.fromUserId;
            }
        });

        res.json({data: data});

    } catch(err){
        res.status(400).send("Error in fetching all the connections: "+err.message);
    }
})

module.exports = userRouter;