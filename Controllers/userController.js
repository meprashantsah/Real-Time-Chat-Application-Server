// const express = require("express");
const expressAsyncHandler = require("express-async-handler")
const userModel = require("../modals/userModel");
const generateToken = require("../Config/generateToken");


// login
const loginController = expressAsyncHandler(async(req,res) => {
    console.log(req.body)
    const {name,password} = req.body;

    const user = await userModel.findOne({name});

    console.log(await user.matchPassword(password))
    if(user && (await user.matchPassword(password))){
        const response={
            _id: user._id,
            name: user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            token:generateToken(user._id),
        };
        console.log(response)
        res.json(response)
    }
    else{
        res.status(401).send()
        throw new Error("Invalid userName or password");
    }

});

// Registration
// expressAsyncHandler help and take care of async operation that we are doing
const registerController = expressAsyncHandler ( async(req,res) =>{
    const {name,email,password} = req.body;

    // check for all fields
    if(!name ||!email ||!password ){
        // res.send(400);
        res.status(400).send()
        throw Error("All necessary input fields have not been filled");
    }

    // pre-existing user
    const userExist = await userModel.findOne({email});
    if(userExist){
        throw new Error("User already exist");
    }
    // userName already taken
    const userNameExist = await userModel.findOne({name});
    if(userNameExist){
        throw new Error("UserName already taken");
    }

    // create an entry in the database
    const user = await userModel.create({ name, email, password});
    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            token:generateToken(user._id),
        })
    }
    else{
        res.status(400).send();
        throw new Error("Registration error");
    }

});

const fetchAllUsersController = expressAsyncHandler(async(req,res)=>{
    const keyword=req.query.search
        ?   {
                $or:[
                    {name: {$regex: req.query.search,$options: "i"}},
                    {email: {$regex: req.query.search,$options: "i"}},
                ],
            }
        :{};
    
    const users = await userModel.find(keyword).find({
        _id: {$ne: req.user._id},
    });
    res.send(users);
});


// const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
//     const keyword = req.query.search
//       ? {
//           $or: [
//             { name: { $regex: req.query.search, $options: "i" } },
//             { email: { $regex: req.query.search, $options: "i" } },
//           ],
//           _id: { $ne: req.user._id },
//         }
//       : { _id: { $ne: req.user._id } };
  
//     const users = await userModel.find(keyword);
//     res.send(users);
// });
  


module.exports = {loginController , registerController, fetchAllUsersController};
