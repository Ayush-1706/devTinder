const express = require('express');

const app = express();

// Request handler
app.get("/user", (request, response) => {
    response.send({"firstName" : "Ayush", "lastName" : "Shukla"});
})

app.post("/user", (request, response) => {
    response.send("Data saved sucessfully...");
})

app.delete("/user", (request, response) => {
    response.send("Data deleted sucessfully...");
})

app.use("/test", (request, response) => {
    response.send('Test...');
})

app.listen(7777, () => {
    console.log('Server is running on port 3000');
});