const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['ignore', 'interested', 'accepted', 'rejected'],
            message: `{VALUE} is not supported`
        }
    }
},
{
    timestamps: true
});

// Compound Index
// 1 is ascending and -1 is descending
// We use compound indexes for making our query faster. Here we are providing indexes to fromUserId and to toUserId, since we are using these fields in our query for data fetching.
connectionRequestSchema.index({fromUserId: 1, toUserId: 1 });

// DB level check to ensure that a user can send only connection request to another user
// Middleware called before saving the connection request in database
connectionRequestSchema.pre("save", function(next){
    const connectionRequest = this;
    // If sender and receiver are same, then throw an error
    // .equals is used because both fromUserId and toUserId are of type ObjectId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error('You cannot send connection request to yourself');
    }
    next();
});

const ConnectionRequest = new mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;