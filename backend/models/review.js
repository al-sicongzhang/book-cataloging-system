const mongoose = require ("mongoose");

const reviewSchema= new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    isbn:{
        type: String, required: true
    },
    rating: { type: Number,
        min: 1,
        max: 5,
        validate: {
          validator: Number.isInteger,
          message: 'Rating must be an integer between 1 and 5'}
        },
    comment: { type: String, default: "" },
},{timestamps: true});

reviewSchema.index({ user_id: 1, isbn: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);