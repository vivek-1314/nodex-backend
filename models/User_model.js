const mongoose = require('mongoose');
const Post = require('./post_model');

const userSchema = new mongoose.Schema({
    firebaseUID: { 
        type: String,  
        required: true,
        unique: true 
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePicUrl: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    professionalTitle: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    skills: {
        type: [String], 
        default: []
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Post"
    }],
    followers: {
        type: [mongoose.Schema.Types.ObjectId], 
        ref: "User",
        default: []
    },
    following: {
        type: [mongoose.Schema.Types.ObjectId], 
        ref: "User",
        default: []
    },
    phoneno :{
        type : Number ,
        default: null
    },
    lookingfor :{
        type: String,
        default : ""
    },
    canoffer :{
        type : String ,
        default : "" 
    },
    linkdinurl: {
        type: String ,
        default : ""
    },
    industry : {
        type : String ,
        default : ""
    },
    portfolio : {
        type:String ,
        default : ""
    }
}, { timestamps: true });

const User_model = mongoose.model("User", userSchema);
module.exports = User_model;