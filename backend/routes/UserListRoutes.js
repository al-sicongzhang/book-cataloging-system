const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authenticate");
const userlistController = require('../controllers/userListController');


// add book API
router.post('/add', authenticateToken, userlistController.addBookToUserList);

// get all book API
router.get("/get", authenticateToken, userlistController.getUserList);

//delete book API
router.delete("/delete", authenticateToken, userlistController.deleteBookFromUserList);

module.exports = router;