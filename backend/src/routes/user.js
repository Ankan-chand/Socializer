// Import the Express framework
const express = require('express');

// Import the user controller functions
const { registerUser, userLogin, userLogout, updatePassword, updateProfile, deleteProfile, myProfile, getUserProfile, forgotPassword, resetPassword, myPosts, getAllUsers, getUserPosts } = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');
const { followAndUnfollowUser } = require('../controllers/user');
const singleUpload = require('../middlewares/multer');

// Create a new router instance
const router = express.Router();

// Define the routes for user registration, login, and logout
router.route("/register").post(singleUpload, registerUser);
router.route("/login").post(userLogin);
router.route("/logout").get(userLogout);
router.route("/user/follow/:id").get(isAuthenticated, followAndUnfollowUser);
router.route("/update/password").put(isAuthenticated, updatePassword);
router.route("/update/profile").put(isAuthenticated, singleUpload, updateProfile);
router.route("/delete/me").delete(isAuthenticated, deleteProfile);
router.route("/me").get(isAuthenticated, myProfile);
router.route("/my/posts").get(isAuthenticated, myPosts);
router.route("/userposts/:id").get(isAuthenticated, getUserPosts);
router.route("/user/:id").get(isAuthenticated, getUserProfile);
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/forgot/password").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);


// Export the router for use in other parts of the application
module.exports = router;