const usermodel = require('../models/User_model') ;
const userIndex = require("../meili");

const searhforuser = async(req , res , next) => {
    const { query } = req.query;
    const uid = req.user.uid;
    const searchResults = await userIndex.search(query , {
        filter: `id != "${uid}"`  
    });
    return res.status(201).json(searchResults.hits);
}

const userprofile = async (req, res, next) => {
    const uid = req.query.id;
    const loggedInUserId = req.user.uid;
    try {
        const loginuser = await usermodel.findOne({ firebaseUID: loggedInUserId }) ;
        const profileuser = await usermodel.findOne({ firebaseUID: uid }) ;

        if (!profileuser) return res.status(404).json({ error: "User not found" });

        const isFollowed = profileuser.followers.includes(loginuser._id);
        return res.status(201).json({ ...profileuser.toObject(), isFollowed }); 
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    searhforuser ,
    userprofile
}