// Import the Mongoose, bcrypt, and jsonwebtoken libraries
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Define a new Mongoose schema for a user object
const userSchema = new mongoose.Schema({
  // Define a string field for the user's name
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },

  // Define an object field containing the public ID and URL of the user's avatar image
  avatar: {
    public_id: String,
    url: String,
  },

  // Define a string field for the user's email address
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: [true, "The email already exists"],
  },

  // Define a string field for the user's password, which is hashed using bcrypt before being stored in the database
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },

  // Define an array of post IDs that the user has created
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  // Define an array of user IDs who follow the user
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // Define an array of user IDs who the user follows
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  resetPasswordToken: String,

  resetPasswordExpire: Date,
});

// Define a pre-save hook to hash the user's password before saving it to the database
userSchema.pre("save", async function (next) {
  if(this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// Define a method to compare a given password with the user's hashed password to determine if they match
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password,this.password);
};

// Define a method to generate a JSON Web Token (JWT) for the user using their ID and a secret key stored in the `JWT_SECRET` environment variable
userSchema.methods.generateToken = async function () {
  return await jwt.sign({_id:this._id, name:this.name},process.env.JWT_SECRET);
};

userSchema.methods.getResetPasswordToken = async function() {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10*60*1000;

  return resetToken; //resetToken without hash
};

// Export the user schema as a Mongoose model called "User"
module.exports = mongoose.model("User", userSchema);


