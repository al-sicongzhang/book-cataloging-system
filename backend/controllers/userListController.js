const User = require("../models/User");
const UserList = require("../models/UserList");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// add book to my list
exports.addBookToUserList = async (req,res)=>{
    try{
        const user_id = req.user.id;
        const{isbn,title,author,image_url} =req.body;
        if(!isbn){
            return res.status(400).json({message:"ISBN is required"});
        }

        const existing= await UserList.findOne({user_id,isbn});
        if(existing){
            return res.status(409).json({status:"already",message:"Book already in your list"});
        }

        const newBook= new UserList({user_id, isbn, title, author, image_url});
        await newBook.save();
        
        res.status(201).json({
            status:"success",
            message:"Book added to your list",
            data: newBook
        })
    }catch(err){
        console.error('error:',err);
        res.status(500).json({message:'Server error'});
    }
};

// get all book info database
exports.getUserList = async (req, res) => {
    try {
      const user_id = req.user.id;
      const books = await UserList.find({ user_id });
  
      res.status(200).json({
        status: "success",
        data: books
      });
    } catch (err) {
      console.error("Error fetching user list:", err);
      res.status(500).json({ message: "Server error" });
    }
};


  // delete book from my list
exports.deleteBookFromUserList = async (req, res) => {
    try {
      const user_id = req.user.id;
      const { isbn } = req.body;
      if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
      }
  
      const deleted = await UserList.findOneAndDelete({ user_id, isbn });
  
      if (!deleted) {
        return res.status(404).json({ message: "Book not found in your list" });
      }
  
      res.status(200).json({
        status: "success",
        message: "Book removed from your list",
      });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  