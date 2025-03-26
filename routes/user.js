const express = require('express');
const {getuserdetails , loginuser , updateuserdetails , followpeople , unfollowPeople} = require('../controllers/User_controller') ;
const {authMiddleware} = require('../middlewares/auth') ;
const router = express.Router();

router.post('/login' , loginuser) ;
router.get('/userdetail' , authMiddleware , getuserdetails) ;
router.put('/updateuser/', authMiddleware , updateuserdetails) ;
router.patch('/followpeople', authMiddleware , followpeople) ;
router.patch('/unfollowpeople', authMiddleware , unfollowPeople) ;

module.exports = router ;
