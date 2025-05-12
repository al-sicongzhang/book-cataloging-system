const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticate");
const reviewController = require("../controllers/reviewController");

// add or update review
router.post("/addOrUpdate", authenticateToken, reviewController.addOrUpdateReview);

// （optional）get all review from all user
// router.get("/:isbn", authenticateToken, reviewController.getUserReview);

// get all review for an user
router.get("/getall",authenticateToken,reviewController.getReviewByUser);

//delete review from mylist
router.delete("/delete",authenticateToken,reviewController.deleteReview)

module.exports = router;
