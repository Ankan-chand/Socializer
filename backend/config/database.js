// Import theongoose library
const mongoose = require("mongoose");

// Define a function to connect to the database
exports.connectDatabase = () => {
  // Set the strictQuery option to true
  mongoose.set("strictQuery", true);

  // Connect to the database using the MONGO_URI environment variable
  mongoose
    .connect(process.env.MONGO_URI)
    .then((con) => {
      // Log a success message if the connection is successful
      console.log(`Connected to SocialMedia successfully: ${con.connection.host}`);
    })
    .catch((err) => {
      // Log an error message if the connection fails
      console.log(err);
    });
};