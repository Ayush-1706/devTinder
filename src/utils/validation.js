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

module.exports = {
    validateSignupData
};