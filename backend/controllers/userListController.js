const User = require("../models/User");
const UserList = require("../models/UserList");
const Review = require("../models/review");
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
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      const ratingFilter =  req.query.rating;

      const allbooks = await  UserList.find({user_id});
      const allIsbn = allbooks.map(book=>book.isbn);

      let filteredIsbns = allIsbn;
      if( ratingFilter && ratingFilter !== "all"){
        const reviewFilter ={user_id};
      
        if (ratingFilter === "na") {
          const reviewedIsbns = await Review.find({ user_id }).distinct("isbn");
         
          const neverReviewedIsbns = allIsbn.filter(
            isbn => !reviewedIsbns.includes(isbn)
          );//contain isbn that no any review

          //all book without rating
          const nullRatedReviews = await Review.find({
          user_id,
          $or: [
            { rating: { $exists: false } },
            { rating: null },
            { rating: { $not: { $in: [1, 2, 3, 4, 5] } } }
          ],
        });
        const nullRatedIsbns = nullRatedReviews.map(r => r.isbn);// change all book without rating to isbn

        filteredIsbns = [...new Set([...neverReviewedIsbns, ...nullRatedIsbns])];
        }else {
          reviewFilter.rating = parseInt(ratingFilter);
          const matchedReviews = await Review.find(reviewFilter);
          filteredIsbns = matchedReviews.map(r => r.isbn);
        }
      }

      const books = await UserList.find({
        user_id,
        isbn: { $in: filteredIsbns },
      })
      .skip(skip)
      .limit(limit);

      const total = filteredIsbns.length;

  
      res.status(200).json({
        status: "success",
        data: books,
        page,
        totalPages:Math.ceil(total/limit),
        totalItem:total,
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
  
  