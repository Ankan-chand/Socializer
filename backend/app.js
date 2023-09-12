// Import Express and cookie-parser libraries
const express = require('express');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/Error.js');
const ErrorHandler = require('./utils/ErrorHandler.js');
const cors = require("cors");

// Create a new Express app instance
const app = express();

// Load environment variables if not in production
if(process.env.NODE_ENV !== "production"){
    // dotenv is used to load the environment variables in process.env from config.env
    require('dotenv').config({path: 'backend/config/config.env'});
};

//add cors
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT']
}))

// Use middleware to parse JSON and URL-encoded request bodies, and cookies
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Import the post and user routes
const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');

// Use the post and user routes
app.use("/api/v1", postRoutes);
app.use("/api/v1",userRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Export the app for use in other parts of the application
module.exports = app;

