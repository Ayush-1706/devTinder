const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const USER_SAFE_DATA = 'firstName lastName gender age photoUrl about skills'
// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        // toUserId should be of of loggedIn user
        // Status should be interested
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName", "age", "about", "photoUrl", "gender", "skills"]);

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
                { fromUserId: loggedInUser._id, status: "accepted" }
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

// Fetch the feed for the loggedIn user
userRouter.get("/user/feed", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        
        const skip = (page - 1)*limit;
        // LoggedIn user should see all the profiles except following:
        // Profiles to whom connection request is already sent or received
        // Ignored profiles
        // Profiles who are already the connections
        // Self profile


        const connectionRequest = await ConnectionRequest.find({
            $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }]
        }).select("fromUserId toUserId");            // select user to filter out data from results

        // Creating a unique set of user Ids which we need to hide from feed
        const hideUsersFromFeed = new Set();
        connectionRequest.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const user = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },       // FInding all the profiles in the database whose Id is not in hideuserFromFeed array
                { _id: { $ne: loggedInUser._id } }                      // Ignore self profile
            ]
        })
        .select(USER_SAFE_DATA)
        .skip(skip)
        .limit(limit);
        
        res.send(user);

    } catch(err){
        res.status(400).send("Failed fetching feed: " + err.message)
    }
})

module.exports = userRouter;