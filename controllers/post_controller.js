const postmodel = require('../models/post_model') ;
const usermodel = require('../models/User_model') ;
const admin = require('../firebaseadmin') ;

const createpost = async (req, res, next) => {
    try {
        const {title, content, tags } = req.body;
        const id = req.user.uid;
        
        if (!req.file) return res.status(400).json({ error: "Image is required" });
    
        const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        
        const newPost = await postmodel.create({
                                                firebaseUID: id,
                                                title,
                                                content,
                                                tags: tags ? tags.split(",") : [], 
                                                imageUrl,
                                            });

        const user = await usermodel.findOne({firebaseUID: id});                                 
        user.posts.push(newPost._id);
        await user.save();

        return res.status(201).json({ message: "Post created successfully!", post: newPost });
      } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Server error" });
      }
}

const getposts = async (req, res, next) => {
    try {
        const id = req.user.uid; 
        const user = await usermodel.findOne({firebaseUID: id}).populate("posts");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(201).json({ posts: user.posts }); 
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const getfeed = async (req , res , next) => {
        try {
            const id  = req.user.uid;
            // const lastFollowedPostId = req.query.lastFollowedPostId;
            // const lastRandomPostId = req.query.lastRandomPostId; 
            const lastFollowedPostCreatedAt = req.query.lastFollowedPostCreatedAt ;
            const lastRandomPostCreatedAt = req.query.lastRandomPostCreatedAt ;

            const user = await usermodel.findOne({firebaseUID: id});  
            const followingIds = user.following || []; 

            const followingUsers = await usermodel.find(
                { _id: { $in: followingIds } }, 
                { firebaseUID: 1, _id: 0 } 
            );

            // Extract firebaseUIDs into an array
            const followingFirebaseUIDs = followingUsers.map(user => user.firebaseUID);
            
            let followingPosts = [];
            let randomPosts = [];

            // Fetch 5 posts from followed users
            if (followingIds.length > 0) {
                    followingPosts = await postmodel.aggregate([
                        { 
                            $match: { 
                                firebaseUID: { $in: followingFirebaseUIDs },
                                ...(lastFollowedPostCreatedAt && { createdAt: { $lt: new Date(lastFollowedPostCreatedAt) } }) // Ensures proper date comparison
                            } 
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 },
                        { 
                            $lookup: {
                                from: "users", 
                                localField: "firebaseUID", 
                                foreignField: "firebaseUID", 
                                as: "userDetails"
                            }
                        },
                        { $unwind: "$userDetails" },
                    ])
                }
            
            randomPosts = await postmodel.aggregate([
                { 
                    $match: { 
                        firebaseUID: { $nin: [...followingFirebaseUIDs, id] }, 
                        ...(lastRandomPostCreatedAt && { createdAt : { $lt: new Date(lastRandomPostCreatedAt) } })
                    } 
                },
                { $sort: { createdAt: -1 } }, 
                { $limit: 5 },
                { 
                    $lookup: {
                        from: "users", // Name of the users collection
                        localField: "firebaseUID", 
                        foreignField: "firebaseUID", 
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" }
            ]);

            const newlastFollowedPostCreatedAt = followingPosts.length > 0 ? followingPosts[followingPosts.length - 1].createdAt : lastFollowedPostCreatedAt;
            const newlastRandomPostCreatedAt = randomPosts.length > 0 ? randomPosts[randomPosts.length - 1].createdAt : lastRandomPostCreatedAt;
    
            // Merge and send response
            const feed = [...followingPosts, ...randomPosts];
            res.status(200).json({ feed  , newlastFollowedPostCreatedAt , newlastRandomPostCreatedAt});
        } catch (error) {
            res.status(500).json({ error: "Failed to load feed" });
        }
}

const addcomment = async (req , res , next) => {
    try {
    const uid = req.user.uid ;
    const {comment} = req.body ;
    const { postid } = req.params;

    const user = await usermodel.findOne({firebaseUID: uid});  
    
    if (!comment) {
        return res.status(400).json({ message: "Comment text is required." });
    }

    const post = await postmodel.findById(postid);
    if (!post) {
        return res.status(404).json({ message: "Post not found." });
    }

    const newComment = {
        userId : user._id,
        name: user.name ,
        profilePicUrl: user.profilePicUrl  ,
        professionalTitle: user.professionalTitle ,
        text : comment,
        createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();
    
    res.status(201).json({ message: "Comment added successfully", post });
    }
    catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Server error" });
    }
}
    

module.exports = {
    createpost,
    getposts ,
    getfeed,
    addcomment
}