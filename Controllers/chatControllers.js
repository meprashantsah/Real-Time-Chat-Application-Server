const asyncHandler = require("express-async-handler");
const Chat = require("../modals/chatModel");
const User = require("../modals/userModel");

const accessChat = asyncHandler(async(req,res)=>{
    const {userId} = req.body;

    if(!userId){
        console.Console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    var isChat= await Chat.find({
        isGroupChat: false,
        $and: [
            {users: { $elemMatch: { $eq: req.user._id}}},
            {users: { $elemMatch: { $eq: userId }}},
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat,{
        path:"latestMessage.sender",
        select: "name email",
    });

    if(isChat.length > 0){
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            chatName: "sender",
            isGroupChat:false,
            users :[req.user._id, userId],
        };
        try{
            const createdChat= await Chat.create(chatData);
            const FullChat = await Chat.findOne({_id: createdChat._id}).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        }
        catch(error){
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = asyncHandler(async (req,res) => {
    try{
        console.log("Fetch Chats aPI : ", req);
        Chat.find({users: {$elemMatch:{$eq: req.user._id}}})
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt: -1})
        .then(async (results)=>{
            results = await User.populate(results,{
                path :"latestMessage.sender",
                select:"name email",
            });
            res.status(200).send(results);
        });
    }
    catch(error){
        res.status(400);
        throw new Error(error.message);
    }
});

const fetchGroups = asyncHandler(async(req,res) =>{
    try{
        const allGroups= await Chat.where("isGroupChat").equals(true);
        res.status(200).send(allGroups);
    }
    catch(error){
        res.status(400);
        throw new Error(error.message);
    }
});

// const createGroupChat = asyncHandler (async(req,res) =>{
//     if(!req.body.users || req.body.name){
//         return res.status(400).send({message:"Data is insufficient"})
//     }

//     var users = JSON.parse(req.body.users)
//     console.log("chatController/createGroups :" ,req);
//     users.push(req.user);

//     try{
//         const groupChat = await Chat.create({
//             chatName : req.body.name,
//             users: users,
//             isGroupChat: true,
//             groupAdmin: req.user,
//         });

//         const fullGroupChat= await Chat.findOne({_id:groupChat._id})
//             .populate("users","-password")
//             .populate("groupAdmin","-password")

//         res.status(200).json(fullGroupChat);
//     }
//     catch(error){
//         res.status(400);
//         throw new Error(error.message);
//     }
// });


const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Data is insufficient" });
    }

    let users = req.body.users;

    if (users.length < 2) {
        return res.status(400).send({ message: "At least 2 users are required to form a group chat" });
    }

    users.push(req.user._id); // assuming req.user is populated via auth middleware

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});



const groupExit = asyncHandler(async(req,res)=>{
    const {chatId,userId} = req.body;

    // check if the requester is admin

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            // Remove the specified user from the 'users' array
            $pull: { users: userId },
        },
        { 
            new: true ,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin","-password");
    
    if(!removed){
        res.status(404);
        throw new Error("Chat not found")
    }
    else{
        res.json(removed)
    }
});

// const addSelfToGroup = asyncHandler(async(req,res)=>{
//     const {chatId,userId} = req.body;
//     const added = await Chat.findByIdAndUpdate(
//         chatId,
//         {
//             $push: {users: userId},
//         },
//         {
//             new: true,
//         }
//     )
//         .populate("users", "-password")
//         .populate("groupAdmin","-password");

//     if(!added){
//         res.status(404);
//         throw new Error("Chat not found")
//     }
//     else{
//         res.json(added);
//     }
// });

module.exports = {
    accessChat,fetchChats,fetchGroups,createGroupChat,groupExit
};


