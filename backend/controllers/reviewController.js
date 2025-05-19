const Review = require("../models/review");
const User=require("../models/User");
const UserList=require("../models/UserList");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// add or update a review for books
exports.addOrUpdateReview = async (req, res)=>{
    try{
        const user_id = req.user.id;
        let {isbn,rating,comment}=req.body;


        if((rating === undefined || rating === null) &&
        (!comment || comment.trim() === "")){
            return res.status(400).json({
                status:"fail",
                message:"At least rating or comment is required"
            });
        }

        if(rating!== undefined){
            rating = Number(rating);
            if (isNaN(rating)) {
                rating = null;
              } else if(!Number.isInteger(rating)||rating<1||rating>5){
                return res.status(400).json({
                    status:"fail",
                    message:"Rating must be an integer between 1 and 5"
                });
            }
        }

        const updatedReview = await Review.findOneAndUpdate(
            {user_id,isbn},
            {
                $set:{
                    ...(rating !== undefined ? {rating}:{}),
                    ...(comment !== undefined ? { comment } : {}),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({
            status: "success",
            data: updatedReview,
          });
    }catch (err) {
            console.error("Error in addOrUpdateReview:", err);
            res.status(500).json({
              status: "error",
              message: "Server error while saving review.",
            });
    }
};

//get all review 
exports.getReviewByUser=async(req,res)=>{
    try{
        const user_id=req.user.id;
        const review=await Review.find({user_id});

        res.status(200).json({
            status:"success",
            data:review,
        });
    }catch(err){
        console.error("Error fetching user reviews:",err);
        res.status(500).json({
            status:"error",
            message:"Server error while fetching reviews.",
        })

    }
};

//delete review
exports.deleteReview= async(req,res)=>{
    try{
        const user_id=req.user.id;
        const {isbn}= req.body;
        if(!isbn){
            return res.status(400).json({ message: "ISBN is required" });
        }

        const deleted = await Review.findOneAndDelete({user_id,isbn});

        if (!deleted) {
            return res.status(404).json({ message: "Book not found in your list" });
        }
        res.status(200).json({
            status: "success",
            message: "Review deleted",
          });
    } catch (err) {
          console.error("Delete error:", err);
          res.status(500).json({ message: "Server error" });
    }
}

