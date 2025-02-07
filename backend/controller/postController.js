import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comments.model.js";

// create Post
export const creatPost = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.mimetype.split("/")[1] : "",
    });
    await post.save();
    return res.status(200).json({ message: "Post created" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: message.error });
  }
};

// getAllPost
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name userName email profilePicture"
    );
    return res.json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(500).jsom({ message: message.error });
  }
};

// deletepost
export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User Not Found " });
    }
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post Not Found " });
    }
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }
    await Post.deleteOne({ _id: post_id });
    return res.json({ message: "Post deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: message.error });
  }
};
// commentPost
export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User Not Found " });
    }
    const post = await Post.findOne({
      _id: post_id,
    });
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: commentBody,
    });
    await comment.save();
    return res.json({ message: "Comment Added" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: message.error });
  }
};
// get_all_comment
export const get_all_comment = async (req, res) => {
  const { post_id } = req.query;
  try {
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post Not Found " });
    }
    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "userName name"
    );

    return res.json(comments.reverse());
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: message.error });
  }
};
//delete_comment
export const delete_comment = async (req, res) => {
  const { token, comment_id } = req.body;
  try {
    const user = await User.findOne({ token: token }.select(_id));
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      return res.status(500).json({ message: "Comment Not Found" });
    }
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }
    await comment.deleteOne({ _id: comment_id });
    return res.json({ message: "Comment Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: message.error });
  }
};

//likes_in_post
export const likes_in_post = async (req, res) => {
  const { post_id } = req.body;
  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    post.likes = (post.likes || 0) + 1;
    await post.save();

    return res.json({ message: "Likes Incremented", likes: post.likes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
