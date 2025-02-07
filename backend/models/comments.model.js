import mongoose from "mongoose";
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  postId: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
  },
  body: {
    type: String,
    require: true,
  },
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
