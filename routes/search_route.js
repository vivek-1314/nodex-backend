const express = require('express') ;
const {searhforuser , userprofile} = require("../controllers/search_controller") ;
const { auth } = require('firebase-admin');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router() ;

router.get("/" ,authMiddleware, searhforuser) ;
router.get("/profile" , authMiddleware , userprofile) ;

module.exports = router ;