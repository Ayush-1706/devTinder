const express = require('express');

const app = express();

// Request handler
app.use("/user", 
    (req, resp, next) => {
        console.log("Handling route user 1!!");
        // resp.send("User 1....");
        next();
    },
    (req, resp, next) => {
        console.log("Handling route user 2!!");
        // resp.send("User 2....");
        next();
    },
    (req, resp, next) => {
        console.log("Handling route user 3!!");
        // resp.send("User 3....");
        next();
    },
    (req, resp, next) => {
        console.log("Handling route user 4!!");
        // resp.send("User 4....");
        next();
    },
    (req, resp) => {
        console.log("Handling route user 5!!");
        resp.send("User 5....");
    }
)

app.listen(7777, () => {
    console.log('Server is running on port 3000');
});