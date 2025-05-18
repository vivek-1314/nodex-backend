const usermodel = require('../models/User_model') ;
const userIndex = require("../meili");
const admin = require('../firebaseadmin') ;
const { emit } = require('../models/post_model');
const cloudinary = require("../cloudinary");

const loginuser = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        const decodedtoken = await admin.auth().verifyIdToken(token);
        const {email , name , uid , picture} = decodedtoken ;
        let existingUser = await usermodel.findOne({ email });

        if (!existingUser) {

            let imageUrl = null;
            if (picture) {
                try {
                    const uploadResult = await cloudinary.uploader.upload(picture, {
                        folder: "nodex_profiles",
                        public_id: email, 
                        overwrite: true,
                        resource_type: "image", 
                    });
                    imageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error("Cloudinary Upload Error:", uploadError);
                }
            }

            const newUser = await usermodel.create({
                name: decodedtoken.name ,
                email,
                profilePicUrl: imageUrl ,
                firebaseUID : uid 
            });

            await userIndex.addDocuments([
                { 
                    id: uid.toString(),  
                    name: name,  
                    email: email,  
                    professionalTitle: "",  
                    skills: [],  
                    bio: "",
                    location: "",
                    profilePicUrl: imageUrl
                }
            ]);

            return res.status(200).json({
                success: true,
                message: "User created successfully",
                data: decodedtoken
            });
        } else {
            let imageUrl = null ;
            if (picture) {
                try {
                    const uploadResult = await cloudinary.uploader.upload(picture, {
                        folder: "nodex_profiles",
                        public_id: email, 
                        overwrite: true,
                        resource_type: "image", 
                    });
                    imageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error("Cloudinary Upload Error:", uploadError);
                }
            }
            
                existingUser.firebaseUID = uid;
                existingUser.profilePicUrl = imageUrl;
                await existingUser.save();

            const { hits } = await userIndex.search(email, { filter: `email = "${email}"` });

            if (hits.length) {
                const oldId = hits[0].id;
                await userIndex.deleteDocument(oldId);
            }

            const updatedUser = {
                    id: uid.toString(),
                    name: existingUser.name,
                    email: existingUser.email,
                    professionalTitle: existingUser.professionalTitle || "",
                    skills: existingUser.skills || [],
                    bio: existingUser.bio || "",
                    location: existingUser.location || "",
                    profilePicUrl: imageUrl
                };

                await userIndex.addDocuments([updatedUser]);
            

            return res.status(200).json({
                success: true,
                message: "User exists successfully",
                data: existingUser
            });
        }
    } catch (error) {
        console.error("Error in loginuser:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const getuserdetails = async (req, res , next) => {
    try {
        const id = req.user.uid ;
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await usermodel.findOne({ firebaseUID: id })
                        .populate('followers', 'name profilePicUrl professionalTitle')
                        .populate('following', 'name profilePicUrl professionalTitle');
        

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateuserdetails = async (req , res , next) => {
    try {
        const id = req.user.uid ;
        const updateData = req.body; 
        const updatedUser = await usermodel.findOneAndUpdate({firebaseUID: id}, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found!" });
        await userIndex.updateDocuments([
            {
                id: id.toString(),  
                name: updatedUser.name,
                email: updatedUser.email,
                location: updatedUser.location || "",
                skills: updatedUser.skills || [],
                professionalTitle: updatedUser.professionalTitle || "",
                location: updatedUser.location || ""
            }
        ]);
        
        res.status(200).json({ message: "User updated successfully!", user: updatedUser });
      } catch (error) {
        res.status(500).json({ message: "hello", error: error.message });
      }
}

const followpeople = async (req, res, next) => {
    try {
        const userid = req.user.uid ;
        const followeduserid = req.body.id ;

        const user = await usermodel.findOne({firebaseUID: userid}); 
        const followeduser = await usermodel.findOne({firebaseUID: followeduserid});    

        if (!user || !followeduser) {
            return res.status(404).json({ message: "User not found" });
        }

        await usermodel.updateOne(
            { _id: user._id },
            { $addToSet: { following: followeduser._id } }
        );

        await usermodel.updateOne(
            { _id: followeduser._id },
            { $addToSet: { followers: user._id } }
        );
        return res.status(201).json({ message: "Followed successfully 💖" });

    } catch (error) {     
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

const unfollowPeople = async (req, res, next) => {
    try {
        const userid = req.user.uid;
        const unfollowedUserid = req.body.id;

        const user = await usermodel.findOne({ firebaseUID: userid });
        const unfollowedUser = await usermodel.findOne({ firebaseUID: unfollowedUserid });

        if (!user || !unfollowedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        await usermodel.updateOne(
            { _id: user._id },
            { $pull: { following: unfollowedUser._id } }
        );

        await usermodel.updateOne(
            { _id: unfollowedUser._id },
            { $pull: { followers: user._id } }
        );
        return res.status(200).json({ message: "unFollowed successfully 👍" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    loginuser ,
    getuserdetails ,
    updateuserdetails ,
    followpeople ,
    unfollowPeople
}