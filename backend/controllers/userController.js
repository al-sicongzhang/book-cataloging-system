const User=require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//register function
exports.register=async (req,res)=>{
    try{
        const{username,email,password}=req.body;
        //check if the info already exist  
        const existingUser = await User.findOne({$or:[{email},{username}]})
        if(existingUser){
            return res.status(400).json({message:'Username or email already exist'});
        }
        const newUser = new User({username,email,password});
        await newUser.save();
        //creat a new user

        res.status(201).json({
            status: "success",
            message:'user registered successfully',
            user:{
                id:newUser._id,
                username:newUser.username,
                email:newUser.email
            }
        });//return a json, contain a message and user info
    }catch(err){
        console.error('Register error:',err);
        res.status(500).json({message:'Server error during registration'});
    }
};

//login function
exports.login = async (req, res) => {
    try{
        //POST user's email and password
        const { email, password } = req.body;
        //find user from database
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i')  });
        if (!user) {
            return res.status(401).json({ status: "fail", message: "Invalid email or password" });
          }
        //check if password match with database
        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message:'Invalid email or password'});
        }

        const token =jwt.sign(
            {id:user._id,username:user.username},
            process.env.JWT_SECRET,
        )
        //return 201 if match
        res.status(201).json({
            status: "success",
            message:'login successfully',
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        });
    }catch(err){
        console.error('login error:',err);
        res.status(500).json({status: "error",message:'Server error'});
    }
};