const User =require("../models/User"); // Import the User model
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library

// Export a middleware function called `isAuthenticated` that checks if a user is authenticated or not
exports.isAuthenticated = async (req,res,next) => {
    try{
        // Extract the `token` from the request cookies
        const {token} = req.cookies;

        // If there is no `token`, send a `401 Unauthorized` response with an error message
        if(!token) {
            return res.status(401).json({
                message:"Please login first!"
            });
        };

        // If there is a `token`, verify the token using the `jwt.verify()` method and the `JWT_SECRET` environment variable
        const decoded = await jwt.verify(token,process.env.JWT_SECRET);

        // Extract the user ID from the decoded token and find the user in the database using the `User.findById()` method
        req.user = await User.findById(decoded._id);

        // Set the `user` object in the request object and call the `next()` function to pass control to the next middleware function
        next();
    } catch(error) {
        // If there is an error during any of these processes, send a `500 Internal Server Error` response with an error message
        res.status(500).json({
        message:error.message
        });
    }
}