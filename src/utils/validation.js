const validator = module.require('validator');

const validateSignupData = (req) => {
    // Extract all the required fields from the request
    const { firstName, lastName, emailId, password } = req.body;
    if(!firstName || !lastName){
        throw new Error("First name and last name are required");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Invalid email");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password not strong");
    }
}

const validateEditProfileData = (req) => {
    const allowedUpdates = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"];
    const isEditAllowed = Object.keys(req.body).every(fields => allowedUpdates.includes(fields));
    return isEditAllowed;
}

const validateEditPassword = (req) => {
    const { password } = req.body;
    return validator.isStrongPassword(password);
}

module.exports = {
    validateSignupData,
    validateEditProfileData,
    validateEditPassword
};