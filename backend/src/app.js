import express from "express";
import {createServer} from "node:http";  //express ke server aur socket ke server ko connect krne ke liye


import mongoose from "mongoose";
import {connectToSocket} from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.route.js"


const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));  //kaafi diff environment variables set kr skte hai
app.use(cors()); //to tackle 'allow http error' 'cross origin request'
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit: "40kb", extended:true}));

app.use("/api/v1/users", userRoutes);

const start = async() => {
    const connectionDB = await mongoose.connect("mongodb+srv://hemantschauhan042_db_user:Fa1nsZi3gm9BPocN@cluster0.lja2scy.mongodb.net/parlons?retryWrites=true&w=majority&appName=Cluster0")
    console.log(`MONGO Connected DB Host: ${connectionDB.connection.host}`)
    server.listen(app.get("port"), () => {
    console.log(`Listening on Port: 8000`);
    })
}

start();

