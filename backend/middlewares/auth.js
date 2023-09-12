const User =require("../models/User"); // Import the User model
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library
const { catchAsyncError } = require("./catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");

// Export a middleware function called `isAuthenticated` that checks if a user is authenticated or not
exports.isAuthenticated = catchAsyncError(async (req,res,next) => {
        // Extract the `token` from the request cookies
        const {token} = req.cookies;

        // If there is no `token`, send a `401 Unauthorized` response with an error message
        if(!token) {
            return next(new ErrorHandler("Please login first", 401));
        };

        // If there is a `token`, verify the token using the `jwt.verify()` method and the `JWT_SECRET` environment variable
        const payload = await jwt.verify(token,process.env.JWT_SECRET);

        // Extract the user ID from the decoded token and find the user in the database using the `User.findById()` method
        req.user = await User.findById(payload._id);

        // Set the `user` object in the request object and call the `next()` function to pass control to the next middleware function
        next();
});