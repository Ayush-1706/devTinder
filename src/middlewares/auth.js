const adminAuth = (req, res, next) => {
    const token = "admin";
    const auntheticatedToken = token == "admin";
    if(!auntheticatedToken){
        res.status(401).send("You are not authorized");
    }
    else{
        next();
    }
}

const userAuth = (req, res, next) => {
    const token = "user";
    const auntheticatedToken = token == "user";
    if(!auntheticatedToken){
        res.status(401).send("You are not authorized");
    }
    else{
        next();
    }
}

module.exports = {adminAuth, userAuth};