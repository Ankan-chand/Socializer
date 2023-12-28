import axios from "axios";


export const likePost = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "likeRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.get(`https://socializer-39eg.onrender.com/api/v1/post/${id}`, {
      headers: {
        "authorization": `Bearer ${authToken}`,
      },
      withCredentials: true,
    });
    dispatch({
      type: "likeSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "likeFailure",
      payload: error.response.data.message,
    });
  }
};


export const addCommentOnPost = (id, comment) => async (dispatch) => {
  try {
    dispatch({
      type: "addCommentRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.put(
      `https://socializer-39eg.onrender.com/api/v1/post/comment/${id}`,
      {
        comment,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${authToken}`,
        },
      }, { withCredentials: true }
    );
 
    dispatch({
      type: "addCommentSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "addCommentFailure",
      payload: error.response.data.message,
    });
  }
};


export const deleteCommentOnPost = (id, commentId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteCommentRequest",
    });
    
    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.delete(`https://socializer-39eg.onrender.com/api/v1/post/comment/${id}`,  {
      data: { commentId },
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${authToken}`,
      },
      withCredentials: true,
    }
    );

    dispatch({
      type: "deleteCommentSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteCommentFailure",
      payload: error.response.data.message,
    });
  }
};


export const createNewPost = (caption, image) => async (dispatch) => {
  try {
    dispatch({
      type: "newPostRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.post(
      `https://socializer-39eg.onrender.com/api/v1/post/upload`,
      {
        caption,
        image,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${authToken}`,
        },
      }, { withCredentials: true }
    );
    dispatch({
      type: "newPostSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "newPostFailure",
      payload: error.response.data.message,
    });
  }
};


export const updatePost = (caption, id) => async (dispatch) => {
  try {
    dispatch({
      type: "updateCaptionRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.put(
      `https://socializer-39eg.onrender.com/api/v1/post/${id}`,
      {
        caption,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${authToken}`,
        },
      }, { withCredentials: true }
    );
    dispatch({
      type: "updateCaptionSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "updateCaptionFailure",
      payload: error.response.data.message,
    });
  }
};



export const deletePost = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deletePostRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.delete(`https://socializer-39eg.onrender.com/api/v1/post/${id}`, {
      headers: {
        "authorization": `Bearer ${authToken}`,
      },
      withCredentials: true,
    });
    dispatch({
      type: "deletePostSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deletePostFailure",
      payload: error.response.data.message,
    });
  }
};


