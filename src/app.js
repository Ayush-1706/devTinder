const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require("cors");

const app = express();

const corsOption = {
    origin: "http://localhost:5173",
    credentials: true,
}

app.use(cors(corsOption));
app.use(express.json()); // Middleware to parse incoming request with JSON payloads
app.use(cookieParser()); // Middleware to parse incoming request cookies

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/requests');
const userRouter = require('./routes/user');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDB()
    .then(() => {
        console.log('Database connected');
        app.listen(7777, () => {
            console.log('Server is running on port 7777');
        });
    }).catch((err) => {
        console.error("Error connecting database", err)
    })