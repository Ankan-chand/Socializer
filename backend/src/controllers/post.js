// Import the Post model for creating a post
const Post = require("../models/Post");
// Import the User model to push the post to the authenticated user
const User = require("../models/User");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
// const getDataUri = require("../utils/dataUri");
const cloudinary = require("cloudinary");




// Export a function called `createPost` that creates a new post and associates it with the currently authenticated user
exports.createPost = catchAsyncError(async (req, res, next) => {
  const { caption } = req.body;
  const file = req.body.image;

  if (!file && !caption) {
    return next(new ErrorHandler("Please fill any of the field", 400));
  }

  let newPostData = {
    caption: undefined,
    image: undefined,
    owner: req.user._id, // The ID of the authenticated user
  };

  if (file) {
    // const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(file, {
      folder:"posts"
    });


    // Create a new `newPostData` object containing the post's caption, image public ID and URL, and the ID of the authenticated user
    newPostData = {
      caption: caption,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },

      owner: req.user._id, // The ID of the authenticated user
    };
  } else {
    newPostData = {
      caption: caption,
      owner: req.user._id, // The ID of the authenticated user
    };
  }

  // Use the `Post.create()` method to create a new post in the database using the `newPostData` object
  const newPost = await Post.create(newPostData);

  // Retrieve the authenticated user using their ID and add the new post's ID to their `posts` array
  const user = await User.findById(req.user._id);
  user.posts.unshift(newPost._id);

  // Save the updated user object to the database
  await user.save();

  // Send a JSON response with a `201 Created` status code and the newly created post object
  res.status(201).json({
    success: true,
    message:"Post created"
  });
});






// Export a function called `deletePost` that deletes a post from the db and the posts array of the currently authenticated user
exports.deletePost = catchAsyncError(async (req, res, next) => {
  // Find the post by ID
  const post = await Post.findById(req.params.id);

  // If the post is not found, return a 404 error
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // Check if the user is authorized to delete the post
  if (post.owner.toString() !== req.user._id.toString()) {
    // If the user is not authorized, return a 401 error
    return next(new ErrorHandler("Unauthorized", 401));
  }

  //remove image from cloudinary
  if(post.image.public_id){
    await cloudinary.v2.uploader.destroy(post.image.public_id);
  }

  // Remove the post from the database
  await post.remove();

  // Remove the post ID from the user's list of posts
  let user = await User.findById(req.user._id);
  const index = user.posts.indexOf(req.params.id);
  user.posts.splice(index, 1);
  await user.save();

  // Return a success message
  return res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});








// Export a function called `likeAndUnlikePost` that helps to like or dislike a post
exports.likeAndDislikePost = catchAsyncError(async (req, res, next) => {
  // Find the post by its ID
  let post = await Post.findById(req.params.id);
  if (!post) {
    // If the post is not found, return an error message
    return next(new ErrorHandler("Post not found", 404));
  }
  // Check if the post is already liked by the user
  if (post.likes.includes(req.user._id)) {
    // If the post is already liked by the user, unlike it
    const index = post.likes.indexOf(req.user._id);

    // Use the splice method to remove the user's ID from the array of likes
    post.likes.splice(index, 1); // from the index, how many to delete i.e., 1 element from the index

    await post.save();

    // Return a success message indicating that the post has been unliked
    return res.status(200).json({
      success: true,
      message: "Post unliked",
    });
  } else {
    // If the post is not yet liked by the user, like it
    post.likes.push(req.user._id);

    await post.save();

    // Return a success message indicating that the post has been liked
    return res.status(200).json({
      success: true,
      message: "Post liked",
    });
  }
});






//exports a function `getPostsofFollowing` that retrieves posts from users that the current user is following
exports.getPostsOfFollowing = catchAsyncError(async (req, res, next) => {
  // Find the current user by their ID
  const user = await User.findById(req.user._id);

  // Find all posts where the owner is in the following array of the current user
  const posts = await Post.find({
    owner: {
      $in: user.following,
    },
  }).populate("owner likes comments.user");

  // Return a success message with the retrieved posts in the response body
  res.status(200).json({
    success: true,
    posts:posts.reverse(),
  });
});









// This function updates caption of a post
exports.updateCaption = catchAsyncError(async (req, res, next) => {
  // Find the post to update
  let post = await Post.findById(req.params.id);

  // If the post is not found, send a 404 error response
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // If the currently logged in user is not the owner of the post, send a 401 error response
  if (post.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorised", 401));
  }

  // Get the new caption from the request body
  const { caption } = req.body;

  // If the new caption is missing, send a 500 error response
  if (!caption) {
    return next(new ErrorHandler("Please enter new caption", 500));
  }

  // Update the post's caption to the new caption
  post.caption = caption;

  // Save the updated post to the database
  await post.save();

  // Send a success response with a message indicating the caption was updated
  res.status(200).json({
    success: true,
    message: "Caption updated successfully.",
  });
});









exports.addComments = catchAsyncError(async (req, res, next) => {
  // Find the post by its ID
  let post = await Post.findById(req.params.id);

  if (!post) {
    // If the post is not found, return an error response
    return next(new ErrorHandler("Post not found!", 404));
  }

  // Push a new comment object to the post's comments array
  post.comments.unshift({
    user: req.user._id, // Assuming the authenticated user's ID is available in req.user._id
    comment: req.body.comment, // Assuming the comment text is available in req.body.comment
  });

  // Save the updated post with the new comment
  await post.save();

  // Return a success response
  res.status(200).json({
    success: true,
    message: "Comment added",
  });
});





exports.deleteComments = catchAsyncError(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler("Post not found!", 404));
  }

  const commentIdToDelete = req.body.commentId;

  if (!commentIdToDelete) {
    return next(new ErrorHandler("Comment Id is required", 400));
  }

  let commentIndex = -1;

  // Find the index of the comment to delete
  for (let i = 0; i < post.comments.length; i++) {
    if (post.comments[i]._id.toString() === commentIdToDelete.toString()) {

      if(post.owner.toString() === req.user._id.toString()){
        commentIndex = i;
        break;
      }
      else if(post.comments[i].user.toString() === req.user._id.toString()){
        commentIndex = i;
        break;
      }
      else{
        return next(new ErrorHandler("Unauthorized", 401));
      }
    }
  }

  // If the comment is not found, return an error
  if (commentIndex === -1) {
    return next(new ErrorHandler("Comment not found!", 404));
  }

  // Remove the comment from the array
  post.comments.splice(commentIndex, 1);

  await post.save();

  return res.status(200).json({
    success: true,
    message: "Comment has been deleted",
  });
});

