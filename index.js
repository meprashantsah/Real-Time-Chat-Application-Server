// importing express
const express = require('express');

// dotenv is a module in various programming languages, commonly used in web development, to load environment variables from a file named ".env."
// This practice is particularly useful in development environments to keep sensitive information, like API keys or database credentials, out of your code repository. Instead, you can share a template .env file and have developers fill in their own values locally.
const dotenv = require("dotenv");
const { default: mongoose } = require('mongoose');

// app is our server
const app = express();

const cors =require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use(
    cors({
        origin: "*",
    })
);
dotenv.config();

app.use(express.json());

const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");


// mongoose.connect(): This function is used to establish a connection to the MongoDB database using the provided connection string.
// await is a keyword in JavaScript that is used with asynchronous functions to wait for a Promise to resolve or reject. It can only be used inside an async function. The purpose of await is to pause the execution of the async function until the Promise is settled (resolved or rejected), and then it resumes the execution with the resolved value.

const connectDb = async()=>{
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log("server is connected to database");
    }
    catch(err){
        console.log("server is not connected to database",err.message);
    }
};
connectDb();

app.get("/", (req,res) =>{
    res.send("API is running 2222");
});

app.use("/user",userRoutes);
app.use("/chat",chatRoutes);
app.use("/message",messageRoutes);

// Error handling malwares
app.use(notFound);
app.use(errorHandler)

// console .log(process.env.MONGO_URI)
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log("server is running..."));

// app.listen(PORT,console.log("server is running..."));



// using socket.io

// const io = require("socket.io")(server,{
//     cors: {
//         origin : "*",
//     },
//     pingTimeout : 60000,
// });

// io.on("connection", (socket)=>{

//     socket.on("setup",(user)=>{
//         socket.join(user.data._id);
//         socket.emit("connected");
//     });

//     socket.on("join chat", (room)=>{
//         socket.join(room)
//     });
    
//     socket.on("new message", (newMessageStatus)=>{
//         var chat = newMessageStatus.chat;
//         if(!chat.users){
//             return console.log("chat.users not defined")
//         }
//         chat.users.array.forEach((user) => {
//             if(user._id == newMessageStatus.sender._id) return;

//             socket.in(user._id).emit("message received" , newMessageReceived)
//         });
//     })

// })


