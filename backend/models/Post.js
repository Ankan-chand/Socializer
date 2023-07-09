// Import the Mongoose
const mongoose = require('mongoose');

// Define a new Mongoose schema for a post object
const postSchema = new mongoose.Schema({

  // Define a string field for the post caption
  caption: String,

  // Define an object field containing the public ID and URL of the post image
  image: {
    public_id: String,
    url: String,
  },

  // Define a reference to the user who created the post
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // Define a date field for the post creation date
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Define an array of user IDs who have liked the post
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // Define an array of comment objects, each containing a user ID and comment text
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      comment: {
        type: String,
        required: true,
      },
    }
  ]

});

// Export the post schema as a Mongoose model called "Post"
module.exports = mongoose.model('Post', postSchema);