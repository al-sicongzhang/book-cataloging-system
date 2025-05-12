const mongoose= require ("mongoose");

const userListSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    isbn:{
        type: String,
        required: true
    },
    title: String,
    author: String,
    image_url: String,
    createdAt:{
        type: Date,
        default: Date.now
    }
});

userListSchema.index({user_id:1,isbn:1},{unique:true});

module.exports=mongoose.model("UserList", userListSchema);