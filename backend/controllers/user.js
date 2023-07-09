// Import the User model
const User = require("../models/User");
const Post = require("../models/Post");
const crypto = require("crypto");
const {sendEmail} = require("../middlewares/sendEmail");

// Export a function called `registerUser` that creates a new user in the database
exports.registerUser = async (req, res) => {
  try {
    // Extract the name, email, and password from the request body
    const { name, email, password } = req.body;

    // Check if a user with the same email already exists in the database
    let user = await User.findOne({ email });

    if (user) {
      // If a user with the same email exists, send a `400 Bad Request` response with an error message
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // If a user with the same email does not exist, create a new user with the provided data and a default avatar image
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "sample_id",
        url: "sample_url",
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
  } catch (error) {
    // If an error occurs during the process, send a `500 Internal Server Error` response with an error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export a function called `userLogin` that logs in a user with the provided email and password
exports.userLogin = async (req, res) => {
  try {
    // Extract the email and password from the request body
    const { email, password } = req.body;

    // Check if a user with the provided email exists in the database
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // If a user with the provided email does not exist, send a `400 Bad Request` response with an error message
      return res.status(400).json({
        success: false,
        message: "User not found!!",
      });
    }

    // If a user with the provided email exists, check if the provided password matches the user's hashed password using the `matchPassword()` method defined in the `User` model
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // If the passwords do not match, send a `400 Bad Request` response with an error message
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
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
  } catch (error) {
    // If an error occurs during the process, send a `500 Internal Server Error` response with an error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export a function called `userLogout` that logs out the currently authenticated user
exports.userLogout = async (req, res) => {
  try {
    // Clear the `token` cookie
    res.clearCookie("token").json({
      message: "Logout successfully",
    });
  } catch (err) {
    // If an error occurs during the process, send a `500 Internal Server Error` response with an error message
    res.status(500).json({
      message: err.message,
    });
  }
};

// This function allows currently logged in user to follow or unfollow another user
exports.followAndUnfollowUser = async (req, res) => {
  try {
    // Find the user to follow/unfollow and the currently logged in user
    let followUser = await User.findById(req.params.id);
    let loggedInUser = await User.findById(req.user._id);

    // If the user to follow/unfollow is not found, send a 404 error response
    if (!followUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If the currently logged in user is already following the user, unfollow them
    if (followUser.followers.includes(req.user._id)) {  //can be used loggedInUser._id instead of req.user._id
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
    } else {  // If the currently logged in user is not following the user, follow them
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
  } catch (error) {
    // If there is an error, send an error response with the error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// This function updates the of the currently logged in user
exports.updatePassword = async (req,res) => {

  try {
    // Find the user with the ID of the currently logged in user and select the password field
    let user = await User.findById(req.user._id).select("+password");

    const {oldPassword, newPassword} = req.body;

    // If either oldPassword or newPassword is missing, send a 400 error response
    if(!oldPassword || !newPassword){
      return res.status(400).json({
        success:false,
        message:"Please enter old and new password"
      });
    }

    // Check if the old password matches the user's current password
    const isMatch = await user.matchPassword(oldPassword);

    // If the old password does not match, send a 400 error response
    if(!isMatch){
      return res.status(400).json({
        success:false,
        message:"Incorrect Password",
      });
    }

    // Update the user's password to the new password
    user.password = newPassword;

    // Save the updated user to the database
    await user.save();

    // Send a success response with a message indicating the password was updated
    res.status(200).json({
      success:true,
      message: "Password Updated Successfully.",
    })

  } catch (error) {
    // If there is an error, send an error response with the error message
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }

};


// This function updates the profile of the currently logged in user
exports.updateProfile = async (req,res) => {

  try {
    // Find the user with the ID of the currently logged in user
    let user = await User.findById(req.user._id);
    const {name, email} = req.body;

    // If neither name nor email is provided, send a 400 error response
    if(!name && !email){
      return res.status(400).json({
        success:false,
        message:"Please enter what you want to update"
      })
    }

    // If name is provided, update the user's name
    if(name){
      user.name = name;
    }

    // If email is provided, update the user's email
    if(email){
      user.email = email;
    }

    // Save the updated user to the database
    await user.save();

    // Send a success response with a message indicating the profile was updated
    res.status(200).json({
      success:true,
      message:"Profile Updated Successfully"
    });

  } catch (error) {
    // If there is an error, send an error response with the error message
    res.status(500).json({
      success:false,
      message:error.message,
    });
  }
};


// This function deletes the profile of the currently logged in user
exports.deleteProfile = async (req,res) => {
  try {
    // Find the user with the ID of the currently logged in user
    const user = await User.findById(req.user._id);

    // Get the user ID, posts, following, and followers
    const userId = user._id;
    const posts = user.posts;
    const following = user.following;
    const followers = user.followers;

    // Remove the user from the database
    await user.remove();

    // Set the token cookie to null to log the user out
    res.cookie("token", null, {
      expires:new Date(Date.now()),
      httpOnly:true,
    });

    // Remove all posts associated with the user
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.remove();
    }

    // Remove the user from the followers list of all users they were following
    for (let i = 0; i < following.length; i++) {
      let followUser = await User.findById(following[i]);
      const index = followUser.followers.indexOf(userId);
      followUser.followers.splice(index,1);
      await followUser.save();
    }

    // Remove the user from the following list of all users who were following them
    for (let i = 0; i < followers.length; i++) {
      const followingUser = await User.findById(followers[i]);
      const index = followingUser.following.indexOf(userId);
      followingUser.following.splice(index,1);
      await followingUser.save();
    }

    // Send a success response with a message indicating the profile was deleted
    res.status(200).json({
      success:true,
      message:"Profile deleted Successfully"
    })
  } catch (error) {
    // If there is an error, send an error response with the error message
    res.status(500).json({
      success:false,
      message:error.message,
    });
  }
};


// This function gets the profile of the currently logged in user
exports.myProfile = async (req,res) => {
  try {
    // Find the user with the ID of the currently logged in user and populate their posts
    const user = await User.findById(req.user._id).populate("posts");

    // Send a success response with the user data
    res.status(200).json({
      success:true,
      user
    })

  } catch (error) {
    // If there is an error, send an error response with the error message
    res.status(500).json({
      success:false,
      message:error.message,
    });
  }
};


// This function gets the profile of a user with the given ID
exports.getUserProfile = async (req,res) => {
  try {
    // Find the user with the given ID in the database and populate their posts
    const user = await User.findById(req.params.id).populate("posts");

    // If the user is not found, send a 404 error response
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found!",
      });
    }

    // If the user is found, send a success response with the user data
    res.status(200).json({
      success:true,
      user,
    })
  } catch (error) {
    // If there is an error, send an error response with the error message
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}


exports.forgotPassword = async (req,res) => {
  try {
    let user = await User.findOne({email:req.body.email});

    if(!user) {
      return res.status(404).json({
        success:false,
        message:"User not found!!",
      });
    }

    const resetPasswordToken = await user.getResetPasswordToken();

    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;
    const message = `To reset your password click on the bellow link. This Link will expire in ten miniuts.\n\n${resetUrl}`;

    try {
      await sendEmail({
        email:user.email,
        subject:"Reset Password",
        message,
      });

      res.status(200).json({
        success:true,
        message:`Email Sent to ${user.email}`,
      });

    } catch (error) {

      user.resetPasswordToken = undefined,
      user.resetPasswordExpire = undefined,
      await user.save();

      res.status(500).json({
        success:false,
        message:error.message,
      });
    }

    
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}


exports.resetPassword = async (req,res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {$gt: Date.now()},
    });

    if(!user){
      return res.status(401).json({
        success:false,
        message:"Token is invalid or has expired."
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success:true,
      message:"Your password has been successfully reset."
    })

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}