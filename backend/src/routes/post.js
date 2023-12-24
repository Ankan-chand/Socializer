// Import the Express library, the post controller and auth middleware modules
const express = require('express');
const { createPost, likeAndDislikePost, deletePost, getPostsOfFollowing, updateCaption, addComments, updateComments, deleteComments } = require('../controllers/post');
const { isAuthenticated } = require('../middlewares/auth');
const singleUpload = require('../middlewares/multer');

// Create a new router instance
const router = express.Router();

// Define a route for creating a new post
router.route("/post/upload").post(isAuthenticated,singleUpload, createPost);

router.route("/post/:id").get(isAuthenticated, likeAndDislikePost).put(isAuthenticated, updateCaption).delete(isAuthenticated, deletePost); //Here get req is used because this action is not sending any data. It will just update the state of a post in the database by adding or removing a user's ID from the post's likes array.

router.route("/posts").get(isAuthenticated, getPostsOfFollowing);

router.route("/post/comment/:id").put(isAuthenticated, addComments).delete(isAuthenticated, deleteComments);


// Export the router for use in other parts of the application
module.exports = router;

