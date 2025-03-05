const express = require('express');

const app = express();
const {userAuth, adminAuth} = require('./middlewares/auth')

// Middleware and Request handler
app.use("/admin", adminAuth)

app.get("/user/login", (req, res) => {
    res.send("User login...");
})

app.get("/user/data", userAuth, (req, res) => {
    res.send("User data...");
})

app.get("/admin/getAllData", (req, res) => {
    res.send("User data fetched...");
})

app.delete("/admin/deleteUser", (req, res) => {
    res.send("Deleted user...");
})

app.listen(7777, () => {
    console.log('Server is running on port 7777');
});