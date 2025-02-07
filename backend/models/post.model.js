import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  body: {
    type: String,
    require: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  media: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: true,
  },
  fileType: {
    type: String,
    default: "",
  },
});

const Post = mongoose.model("Post", PostSchema);
export default Post;
