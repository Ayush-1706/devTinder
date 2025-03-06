const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://ayushshukla50:Ashsh%4017@namastenode.q9pxn.mongodb.net/devTinder");
}

module.exports = connectDB;
