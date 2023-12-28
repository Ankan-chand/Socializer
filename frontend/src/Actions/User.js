import axios from "axios";

export const loginUser = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: "LoginRequest",
    });


    const { data } = await axios.post(
      "https://socializer-39eg.onrender.com/api/v1/login",
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    localStorage.setItem("authorization", data.token);

    dispatch({
      type: "LoginSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoginFailure",
      payload: error.response.data.message,
    });
  }
};

export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });

    const authToken = localStorage.getItem("authorization");


    const { data } = await axios.get(
      "https://socializer-39eg.onrender.com/api/v1/me",
      {
        headers: {
          "authorization": `Bearer ${authToken}`,
        },
        withCredentials: true,
      }
    );

    dispatch({
      type: "LoadUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoadUserFailure",
      payload: error.response.data.message,
    });
  }
};

export const getFollowingPosts = () => async (dispatch) => {
  try {
    dispatch({
      type: "postOfFollowingRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.get(
      "https://socializer-39eg.onrender.com/api/v1/posts",
      {
        headers: {
          "authorization": `Bearer ${authToken}`,
        },
        withCredentials: true,
      }
    );

    dispatch({
      type: "postOfFollowingSuccess",
      payload: data.posts,
    });
  } catch (error) {
    dispatch({
      type: "postOfFollowingFailure",
      payload: error.response.data.message,
    });
  }
};

export const getAllUsers =
  (name = "") =>
  async (dispatch) => {
    try {
      dispatch({
        type: "allUsersRequest",
      });

      const authToken = localStorage.getItem("authorization");

      const { data } = await axios.get(
        `https://socializer-39eg.onrender.com/api/v1/users?name=${name}`,
        {
          headers: {
            "authorization": `Bearer ${authToken}`,
          },
          withCredentials: true,
        }
      );

      dispatch({
        type: "allUsersSuccess",
        payload: data.users,
      });
    } catch (error) {
      dispatch({
        type: "allUsersFailure",
        payload: error.response.data.message,
      });
    }
  };

export const getMyPosts = () => async (dispatch) => {
  try {
    dispatch({
      type: "myPostsRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.get(
      "https://socializer-39eg.onrender.com/api/v1/my/posts",
      {
        headers: {
          "authorization": `Bearer ${authToken}`,
        },
        withCredentials: true,
      }
    );

    dispatch({
      type: "myPostsSuccess",
      payload: data.posts,
    });
  } catch (error) {
    dispatch({
      type: "myPostsFailure",
      payload: error.response.data.message,
    });
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LogoutUserRequest",
    });

    await axios.get("https://socializer-39eg.onrender.com/api/v1/logout");

    localStorage.removeItem("authorization");

    dispatch({
      type: "LogoutUserSuccess",
    });
  } catch (error) {
    dispatch({
      type: "LogoutUserFailure",
      payload: error.response.data.message,
    });
  }
};

export const registerUser =
  (name, email, password, avatar) => async (dispatch) => {
    try {
      dispatch({
        type: "RegisterRequest",
      });

      const { data } = await axios.post(
        "https://socializer-39eg.onrender.com/api/v1/register",
        { name, email, password, avatar },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await localStorage.setItem("authorization", data.token);

      dispatch({
        type: "RegisterSuccess",
        payload: data.user,
      });
    } catch (error) {
      dispatch({
        type: "RegisterFailure",
        payload: error.response.data.message,
      });
    }
  };

export const updateProfile = (name, email, avatar) => async (dispatch) => {
  try {
    dispatch({
      type: "updateProfileRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.put(
      "https://socializer-39eg.onrender.com/api/v1/update/profile",
      { name, email, avatar },
      {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${authToken}`,
        },
      },
      { withCredentials: true }
    );

    dispatch({
      type: "updateProfileSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "updateProfileFailure",
      payload: error.response.data.message,
    });
  }
};

export const updatePassword =
  (oldPassword, newPassword) => async (dispatch) => {
    try {
      dispatch({
        type: "updatePasswordRequest",
      });

      const authToken = localStorage.getItem("authorization");

      const { data } = await axios.put(
        "https://socializer-39eg.onrender.com/api/v1/update/password",
        { oldPassword, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${authToken}`,
          },
        },
        { withCredentials: true }
      );

      dispatch({
        type: "updatePasswordSuccess",
        payload: data.message,
      });
    } catch (error) {
      dispatch({
        type: "updatePasswordFailure",
        payload: error.response.data.message,
      });
    }
  };

export const deleteMyProfile = () => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProfileRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.delete(
      "https://socializer-39eg.onrender.com/api/v1/delete/me",
      {
        headers: {
          "authorization": `Bearer ${authToken}`,
        },
        withCredentials: true,
      }
    );

    localStorage.removeItem("authorization");

    dispatch({
      type: "deleteProfileSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteProfileFailure",
      payload: error.response.data.message,
    });
  }
};



export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({
      type: "forgotPasswordRequest",
    });

    const { data } = await axios.post(
      "https://socializer-39eg.onrender.com/api/v1/forgot/password",
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    dispatch({
      type: "forgotPasswordSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "forgotPasswordFailure",
      payload: error.response.data.message,
    });
  }
};

export const resetPassword = (token, password) => async (dispatch) => {
  try {
    dispatch({
      type: "resetPasswordRequest",
    });

    const { data } = await axios.put(
      `https://socializer-39eg.onrender.com/api/v1/password/reset/${token}`,
      {
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    dispatch({
      type: "resetPasswordSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "resetPasswordFailure",
      payload: error.response.data.message,
    });
  }
};

export const getUserPosts = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "userPostsRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.get(
      `https://socializer-39eg.onrender.com/api/v1/userposts/${id}`,
      {
        headers: {
          "authorization": `Bearer ${authToken}`,
        },
        withCredentials: true,
      }
    );
    dispatch({
      type: "userPostsSuccess",
      payload: data.posts,
    });
  } catch (error) {
    dispatch({
      type: "userPostsFailure",
      payload: error.response.data.message,
    });
  }
};

export const getUserProfile = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "userProfileRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.get(
      `https://socializer-39eg.onrender.com/api/v1/user/${id}`,
      {
        headers: {
          "authorization": `Bearer ${authToken}`,
        },
        withCredentials: true,
      }
    );
    dispatch({
      type: "userProfileSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "userProfileFailure",
      payload: error.response.data.message,
    });
  }
};

export const followAndUnfollowUser = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "followUserRequest",
    });

    const authToken = localStorage.getItem("authorization");

    const { data } = await axios.get(
      `https://socializer-39eg.onrender.com/api/v1/user/follow/${id}`,
      {
        headers: {
          "authorization": `Bearer ${authToken}`,
        },
        withCredentials: true,
      }
    );
    dispatch({
      type: "followUserSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "followUserFailure",
      payload: error.response.data.message,
    });
  }
};
