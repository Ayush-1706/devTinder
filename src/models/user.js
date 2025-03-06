const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName : {
        type: String
    },
    emailId : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Invalid email" + value);
            }
        }
    },
    password : {
        type: String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw new Error("Password not strong" + value);
            }
        }
    },
    age : {
        type: Number,
        min: 18
    },
    gender : {
        type: String,
        validate(value) {
            if(!["male", "female", "other"].includes(value)){
                throw new Error("Invalid gender type");
            }
        }
    },
    photoUrl : {
        type: String,
        validate(value) {
            if(!validator.isURL(value)){
                throw new Error("Invalid link for photo url" + value);
            }
        }
    },
    about : {
        type : String,
        default : "Default about of the user"
    },
    skills : {
        type: [String]
    }
}, 
{
    timestamps : true
});

// Do not user arrow function since this is undefined in arrow function. Always use normal function
// Method for generating token
userSchema.methods.getJWTToken = async function() {
    const user = this;
    const token = jwt.sign({_id : user._id}, "DEV@Tinder$17", {expiresIn: "1d"});
    return token;
}

// Method for validating password
userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);
    return isPasswordValid;
}

const User = mongoose.model('User', userSchema);

module.exports = User;