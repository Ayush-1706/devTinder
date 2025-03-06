const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try{
        const {token} = req.cookies;
        // Validate if the token is present in the cookies
        if(!token){
            throw new Error("Token not present in the cookies");
        }

        // Read the token and get the data (here _id) from the token
        const decodedobj = await jwt.verify(token, "DEV@Tinder$17");
        const { _id }  = decodedobj;

        // Fetch the user data from the database using the _id
        const user = await User.findById(_id);
        if(!user){
            throw new Error("User not found");
        }

        // Attaching user object to the request
        req.user = user;
        
        // Go back to request handler
        next();
    } catch(err) {
        res.status(400).send('Error: ' + err.message);
    }
}

module.exports = {userAuth};