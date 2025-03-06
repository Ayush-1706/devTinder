const mongoose = require('mongoose');
const validator = require('validator');

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

const User = mongoose.model('User', userSchema);

module.exports = User;