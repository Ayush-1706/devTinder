const express = require('express');

const app = express();

// Request handler
app.use((request, response) => {
    response.send('Hello from the server side...');
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});