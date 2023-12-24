const app = require("./app"); //require using filename
const cloudinary = require("cloudinary");


// Load environment variables if not in production
if(process.env.NODE_ENV !== "production"){
  // dotenv is used to load the environment variables in process.env from config.env
  require('dotenv').config({path:"config.env"});
};


// connecting database

// const dataBase = require('./db/database');  
// dataBase.connectDatabase();

// or

//it will extract the connectDatabase method from the database.js and store it in a variable with same name
const { connectDatabase } = require("./db/database");
connectDatabase();


//configure cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_USER_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
