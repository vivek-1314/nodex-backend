const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    firebaseUID: { type: String, required: true }, 
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    imageUrl: { type: String, required: true },
    likes: { type: [String], default: [] }, 
    views: { type: Number, default: 0 },
    comments: [
      {
        userId: { type: String, required: true }, 
        name: {type: String,required: true},
        profilePicUrl: { type: String, default: "" },
        professionalTitle: { type: String, default: "" },
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
