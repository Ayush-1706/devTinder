const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');


// Send connection request - interested or ignored
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // Restrict the send status to either "interested" or "ignored"
        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "invalid status", status});
        } 

        // Check if the receiver exists in database
        const receiverExists = await User.findById(toUserId);
        if(!receiverExists){
           return res.status(404).json({message: "Receiver not found!"});
        }

        // Check if the connection request already exists between sender and receiver
        // #Example - 
        // a. If sender is Ayush and receiver is Rishabh, then check if Ayush has already sent a request to Rishabh.
        // b. If sender is Rishabh and receiver is Ayush, then check if Rishabh has already sent a request to Ayush.
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })
        if(existingConnectionRequest){
            return res.status(400).send({message: "Connection request already exists"});
        }

        const connectionRequest = new ConnectionRequest({fromUserId, toUserId, status});
        const data = await connectionRequest.save();
        res.json({
            message: "Request sent with " + status + " status",
            data
        })
    } catch(err) {
        res.status(400).send("Connection error " + err.message);
    }
})

// Review received connection request - accepted or rejected
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        // Validate the status
        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Status is not allowed"})
        }
        
        // Sender => Receiver (No user other than receiver should accept or reject the connection request).
        // toUserId or receiver should be logged in to accept/review the request.
        // status should be interested. User cannot review or accept ignored request.
        // request id should be valid.
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });

        if(!connectionRequest){
            return res.status(400).json({message: "Connection request not found"});
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({message: "Connection request "+status, data});
    } catch(err) {
        res.status(400).send("Review request error: " + err.message);
    }
})

module.exports = requestRouter;