// Import the Post model for creating a post
const Post = require("../models/Post");
// Import the User model to push the post to the authenticated user
const User = require("../models/User");

// Export a function called `createPost` that creates a new post and associates it with the currently authenticated user
exports.createPost = async (req, res) => {
  try {
    // Create a new `newPostData` object containing the post's caption, image public ID and URL, and the ID of the authenticated user
    const newPostData = {
      caption: req.body.caption,

      image: {
        public_id: req.body.public_id, // The public ID of the image uploaded by the user
        url: req.body.url, // The URL of the image uploaded by the user
      },

      owner: req.user._id, // The ID of the authenticated user
    };

    // Use the `Post.create()` method to create a new post in the database using the `newPostData` object
    const newPost = await Post.create(newPostData);

    // Retrieve the authenticated user using their ID and add the new post's ID to their `posts` array
    const user = await User.findById(req.user._id);
    user.posts.push(newPost._id);

    // Save the updated user object to the database
    await user.save();

    // Send a JSON response with a `201 Created` status code and the newly created post object
    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    // If an error occurs during the process, send a JSON response with a `500 Internal Server Error` status code and an error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export a function called `deletePost` that deletes a post from the db and the posts array of the currently authenticated user
exports.deletePost = async (req, res) => {
  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);

    // If the post is not found, return a 404 error
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user is authorized to delete the post
    if (post.owner.toString() !== req.user._id.toString()) {
      // If the user is not authorized, return a 401 error
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
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
  } catch (error) {
    // If there is an error, return a 500 error with the error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export a function called `likeAndUnlikePost` that helps to like or dislike a post
exports.likeAndDislikePost = async (req, res) => {
  try {
    // Find the post by its ID
    let post = await Post.findById(req.params.id);
    if (!post) {
      // If the post is not found, return an error message
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
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
  } catch (error) {
    // If there's an error, return an error message
    res.staus(500).json({
      success: false,
      message: error.message,
    });
  }
};

//exports a function `getPostsofFollowing` that retrieves posts from users that the current user is following
exports.getPostsOfFollowing = async (req, res) => {
  try {
    // Find the current user by their ID
    const user = await User.findById(req.user._id);

    // Find all posts where the owner is in the following array of the current user
    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    });

    // Return a success message with the retrieved posts in the response body
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    // If there's an error, return an error message in the response body
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// This function updates caption of a post
exports.updateCaption = async (req, res) => {
  try {
    // Find the post to update
    let post = await Post.findById(req.params.id);

    // If the post is not found, send a 400 error response
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found!",
      });
    }

    // If the currently logged in user is not the owner of the post, send a 401 error response
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised",
      });
    }

    // Get the new caption from the request body
    const { caption } = req.body;

    // If the new caption is missing, send a 500 error response
    if (!caption) {
      return res.status(500).json({
        success: false,
        message: "Please enter new caption",
      });
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
  } catch (error) {
    // If there is an error, send an error response with the error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addComments = async (req, res) => {
  try {
    // Find the post by its ID
    let post = await Post.findById(req.params.id);

    if (!post) {
      // If the post is not found, return an error response
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    // Push a new comment object to the post's comments array
    post.comments.push({
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
  } catch (error) {
    // If any error occurs during the process, return an error response
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateComments = async (req, res) => {
  try {
    // Find the post by its ID
    let post = await Post.findById(req.params.postid);

    if (!post) {
      // If the post is not found, return an error response
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    let commentIndex = -1;

    // Iterate through the comments array to find the index of the comment to be updated
    post.comments.forEach((item, index) => {
      if (item._id.toString() === req.params.commentid.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      // Check if the user making the request is the owner of the comment
      if (
        post.comments[commentIndex].user.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Update the comment with the new comment text from req.body.comment
      post.comments[commentIndex].comment = req.body.comment;

      // Save the updated post with the modified comment
      await post.save();

      // Return a success response
      res.status(200).json({
        success: true,
        message: "Comment updated",
      });
    } else {
      // If the comment is not found in the comments array, return an error response
      res.status(404).json({
        success: false,
        message: "Comment doesn't exist",
      });
    }
  } catch (error) {
    // If any error occurs during the process, return an error response
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export a function to delete a comment from a post
exports.deleteComments = async (req, res) => {
  try {
    // Retrieve the post from the database using the post ID provided in the request parameters
    let post = await Post.findById(req.params.postid);

    // If the post is not found, return a 404 error
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    // Initialize the index variable to -1
    let index = -1;

    // If the user is the owner of the post, remove the comment from the post's comments array using the comment ID provided in the request parameters
    if (post.owner.toString() === req.user._id.toString()) {
      post.comments.forEach((item, i) => {
        if (item._id.toString() === req.params.commentid.toString()) {
          index = i;
          return post.comments.splice(index, 1);
        }
      });

      // If the comment is not found, return a 404 error
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: "Comment not found!",
        });
      }

      // Save the updated post to the database
      await post.save();

      // Return a success message
      res.status(200).json({
        success: true,
        message: "Comment has been deleted.",
      });
    } else {
      // If the user is not the owner, check if the comment is owned by the user
      post.comments.forEach((item, i) => {
        if (item._id.toString() === req.params.commentid.toString()) {
          // If the comment is owned by the user, remove the comment from the post's comments array
          if (item.user.toString() === req.user._id.toString()) {
            index = i;
            return post.comments.splice(index, 1);
          } else {
            // If the comment is not owned by the user, return a 400 error
            return res.status(400).json({
              success: false,
              message: "Unauthorised!",
            });
          }
        }
      });

      // If the comment is not found, return a 404 error
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: "Comment not found!",
        });
      }

      // Save the updated post to the database
      await post.save();

      // Return a success message
      res.status(200).json({
        success: true,
        message: "Your comment has been deleted.",
      });
    }
  } catch (error) {
    // If there is an error during the process, return a 500 error
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};