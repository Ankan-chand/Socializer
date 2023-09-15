const app = require("./app"); //require using filename
const cloudinary = require("cloudinary");

// connecting database

// const dataBase = require('./config/database');  //require using filename
// dataBase.connectDatabase();

// or

//it will extract the connectDatabase method from the database.js and store it in a variable with same name
const { connectDatabase } = require("./config/database");
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
