// Import the User model
const User = require("../models/User");
const Post = require("../models/Post");
const crypto = require("crypto");
const { sendEmail } = require("../middlewares/sendEmail");
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
// const getDataUri = require("../utils/dataUri");
const cloudinary = require("cloudinary");

// Export a function called `registerUser` that creates a new user in the database
exports.registerUser = catchAsyncError(async (req, res, next) => {
  // Extract the name, email, and password from the request body
  const { name, email, password } = req.body;
  const myFile = req.body.avatar;
  // const myFile = req.file;

  if (!name || !email || !password || !myFile) {
    return next(new ErrorHandler("Please fill the required fields", 400));
  }

  // Check if a user with the same email already exists in the database
  let user = await User.findOne({ email });

  if (user) {
    // If a user with the same email exists, send a `400 Bad Request` response with an error message
    return next(new ErrorHandler("User already exists", 400));
  }

  // const fileUri = getDataUri(myFile);
  const myCloud = await cloudinary.v2.uploader.upload(myFile, {
    folder:"avatars"
  });

  // If a user with the same email does not exist, create a new user with the provided data
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  // Generate a JSON Web Token (JWT) for the user using the `generateToken()` method defined in the `User` model
  const token = await user.generateToken();

  // Set the token as a cookie with an expiration time of 90 days
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // Send a `201 Created` response with the newly created user object and the token
  res.status(201).cookie("token", token, options).json({
    success: true,
    message: "User registered successfully.",
    user,
    token,
  });
});






// Export a function called `userLogin` that logs in a user with the provided email and password
exports.userLogin = catchAsyncError(async (req, res, next) => {
  // Extract the email and password from the request body
  const { email, password } = req.body;

  // Check if a user with the provided email exists in the database
  const user = await User.findOne({ email }).select("+password").populate("posts followers following");

  if (!user) {
    // If a user with the provided email does not exist, send a `400 Bad Request` response with an error message
    return next(new ErrorHandler("User not found", 400));
  }

  // If a user with the provided email exists, check if the provided password matches the user's hashed password using the `matchPassword()` method defined in the `User` model
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    // If the passwords do not match, send a `400 Bad Request` response with an error message
    return next(new ErrorHandler("Incorrect Password", 400));
  }

  // If the passwords match, generate a JWT for the user using the `generateToken()` method
  const token = await user.generateToken();

  // Set the token as a cookie with an expiration time of 90 days
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // Send a `200 OK` response with the user object and the token
  res.status(200).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
});




// Export a function called `userLogout` that logs out the currently authenticated user
exports.userLogout = catchAsyncError(async (req, res, next) => {
  // Clear the `token` cookie
  res.clearCookie("token").json({
    message: "Logout successfully",
  });
});






// This function allows currently logged in user to follow or unfollow another user
exports.followAndUnfollowUser = catchAsyncError(async (req, res, next) => {
  // Find the user to follow/unfollow and the currently logged in user
  let followUser = await User.findById(req.params.id);
  let loggedInUser = await User.findById(req.user._id);

  // If the user to follow/unfollow is not found, send a 404 error response
  if (!followUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  // If the currently logged in user is already following the user, unfollow them
  if (followUser.followers.includes(req.user._id)) {
    //can be used loggedInUser._id instead of req.user._id
    // Find the index of the currently logged in user in the followers array of the user being followed
    const index = followUser.followers.indexOf(req.user._id);
    // Remove the currently logged in user from the followers array of the user being followed
    followUser.followers.splice(index, 1);
    await followUser.save();

    // Find the index of the user being followed in the following array of the currently logged in user
    const myIndex = loggedInUser.following.indexOf(req.params.id);
    // Remove the user being followed from the following array of the currently logged in user
    loggedInUser.following.splice(myIndex, 1);
    await loggedInUser.save();

    // Send a success response with a message indicating the user was unfollowed
    return res.status(200).json({
      success: true,
      message: "Unfollowed successfully",
    });
  } else {
    // If the currently logged in user is not following the user, follow them
    // Add the currently logged in user to the followers array of the user being followed
    followUser.followers.push(req.user._id);
    await followUser.save();

    // Add the user being followed to the following array of the currently logged in user
    loggedInUser.following.push(req.params.id);
    await loggedInUser.save();

    // Send a success response with a message indicating the user was followed
    return res.status(200).json({
      success: true,
      message: "Followed successfully",
    });
  }
});









// This function updates the of the currently logged in user
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  // Find the user with the ID of the currently logged in user and select the password field
  let user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;

  // If either oldPassword or newPassword is missing, send a 400 error response
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please enter old and new password", 400));
  }

  // Check if the old password matches the user's current password
  const isMatch = await user.matchPassword(oldPassword);

  // If the old password does not match, send a 400 error response
  if (!isMatch) {
    return next(new ErrorHandler("Incorrect Password", 400));
  }

  // Update the user's password to the new password
  user.password = newPassword;

  // Save the updated user to the database
  await user.save();

  // Send a success response with a message indicating the password was updated
  res.status(200).json({
    success: true,
    message: "Password Updated Successfully.",
  });
});









// This function updates the profile of the currently logged in user
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  // Find the user with the ID of the currently logged in user
  let user = await User.findById(req.user._id);
  const { name, email } = req.body;
  // const myFile = req.file;
  const myFile = req.body.avatar;

  // If neither name nor email is provided, send a 400 error response
  if (!name && !email && !myFile) {
    return next(new ErrorHandler("Please enter what you want to update", 400));
  }

  // If name is provided, update the user's name
  if (name) {
    user.name = name;
  }

  // If email is provided, update the user's email
  if (email) {
    user.email = email;
  }

  if (myFile) {
    // const fileUri = getDataUri(myFile);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    
    const myCloud = await cloudinary.v2.uploader.upload(myFile, {
      folder:"avatars"
    });

    user.avatar = {
      public_id : myCloud.public_id,
      url : myCloud.secure_url
    }
  }

  // Save the updated user to the database
  await user.save();

  // Send a success response with a message indicating the profile was updated
  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});






// This function deletes the profile of the currently logged in user
exports.deleteProfile = catchAsyncError(async (req, res, next) => {
  // Find the user with the ID of the currently logged in user
  const user = await User.findById(req.user._id);

  // Get the user ID, posts, following, and followers
  const userId = user._id;
  const posts = user.posts;
  const following = user.following;
  const followers = user.followers;

  //removing avatar from cloudinary
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  // Remove the user from the database
  await user.remove();

  // Set the token cookie to null to log the user out
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  // Remove all posts of the user
  for (let i = 0; i < posts.length; i++) {
    const post = await Post.findById(posts[i]);
    await cloudinary.v2.uploader.destroy(post.image.public_id);
    await post.remove();
  }

  // Remove the user from the followers list of all users who are followed by the user
  // for (let i = 0; i < following.length; i++) {
  //   let followUser = await User.findById(following[i]);
  //   const index = followUser.followers.indexOf(userId);
  //   followUser.followers.splice(index, 1);
  //   await followUser.save();
  // }
  await User.updateMany(          //aggregation pipeline
    { _id: { $in: following } },
    { $pull: { followers: userId } }
  );
  


  // Remove the user from the following list of all users who are following the user
  // for (let i = 0; i < followers.length; i++) {
  //   const followingUser = await User.findById(followers[i]);
  //   const index = followingUser.following.indexOf(userId);
  //   followingUser.following.splice(index, 1);
  //   await followingUser.save();
  // }
  await User.updateMany(       //aggregation pipeline
    { _id: { $in: followers } },
    { $pull: { following: userId } }
  );
  

  //reoving all comments of user from all post
  // posts = await Post.find();

  // for (let i = 0; i < posts.length; i++) {
  //   for(let j = 0; j < posts[i].comments.length; j++){
  //     if(posts[i].comments[j].user === userId){
  //       posts[i].comments.splice(j, 1);
  //     }
  //   }
  //   await posts[i].save();
  // }
  await Post.updateMany(   //using mongodb aggregation pipeline
    { 'comments.user': userId },
    { $pull: { comments: { user: userId } } }
  );


  // removing all likes of the user from all posts
  // for (let i = 0; i < posts.length; i++) {
  //     for(let j = 0; j < posts[i].likes.length; j++){
  //       if(posts[i].likes[j] === userId){
  //         posts[i].likes.splice(j, 1);
  //       }
  //     }
  //     await posts[i].save();
  // }
  await Post.updateMany(     //aggregation pipeline
    { likes: userId },
    { $pull: { likes: userId } }
  );
  

  // Send a success response with a message indicating the profile was deleted
  res.status(200).json({
    success: true,
    message: "Profile deleted Successfully",
  });
});






// This function gets the profile of the currently logged in user
exports.myProfile = catchAsyncError(async (req, res, next) => {
  // Find the user with the ID of the currently logged in user and populate their posts
  const user = await User.findById(req.user._id).populate("posts following followers");

  // Send a success response with the user data
  res.status(200).json({
    success: true,
    user,
  });
});






// This function gets the profile of a user with the given ID
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  // Find the user with the given ID in the database and populate their posts
  const user = await User.findById(req.params.id).populate("posts following followers");

  // If the user is not found, send a 404 error response
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  // If the user is found, send a success response with the user data
  res.status(200).json({
    success: true,
    user,
  });
});




exports.getAllUsers = catchAsyncError(async(req, res, next) => {
  const users = await User.find({name: {$regex: req.query.name, $options:"i"}});

  res.status(200).json({
    success:true,
    users
  })
});





// This function gets the own posts of a logged in user
exports.myPosts = catchAsyncError(async (req, res, next) => {
  // Find the user with the given ID in the database
  const user = await User.findById(req.user._id);

  // If the user is not found, send a 404 error response
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  let posts = [];

  // fetch each post using their id and push into the array
  for(let i = 0; i < user.posts.length; i++){
    const post = await Post.findById(user.posts[i]).populate("likes comments.user owner");
    if(post)
      posts.push(post);
  }

  res.status(200).json({
    success: true,
    posts,
  });
});




// This function gets the posts of a user by taking user's id
exports.getUserPosts = catchAsyncError(async (req, res, next) => {
  // Find the user with the given ID in the database
  const user = await User.findById(req.params.id);

  // If the user is not found, send a 404 error response
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  let posts = [];

  // fetch each post using their id and push into the array
  for(let i = 0; i < user.posts.length; i++){
    const post = await Post.findById(user.posts[i]).populate("likes comments.user owner");
    if(post)
      posts.push(post);
  }

  res.status(200).json({
    success: true,
    posts,
  });
});




exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  const resetPasswordToken = await user.getResetPasswordToken();

  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetPasswordToken}`;
  const message = `To reset your password click on the bellow link. This Link will expire in ten miniuts.\n\n${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email Sent to ${user.email}`,
    });
  } catch (error) {
    (user.resetPasswordToken = undefined),
      (user.resetPasswordExpire = undefined),
      await user.save();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});






exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token is invalid or has expired.", 401));
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Your password has been successfully reset.",
  });
});
