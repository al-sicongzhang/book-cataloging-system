const express=require('express');
const router =express.Router();
const userController= require('../controllers/userController');

//register API
router.post('/register',userController.register);

//login API
router.post('/login',userController.login);


module.exports =router;

