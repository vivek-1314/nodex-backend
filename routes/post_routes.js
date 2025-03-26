const express = require('express') ;
const { authMiddleware } = require('../middlewares/auth');
const upload = require('../middlewares/multer') ;
const { createpost , getposts , getfeed , addcomment } = require('../controllers/post_controller') ;

const router = express.Router() ;

router.post("/createpost" , upload.single("image") , authMiddleware, createpost ) ;
router.get("/getposts" , authMiddleware , getposts ) ;
router.get("/getfeed" , authMiddleware , getfeed ) ;
router.patch("/:postid/comment" , authMiddleware , addcomment) ;

module.exports = router ;