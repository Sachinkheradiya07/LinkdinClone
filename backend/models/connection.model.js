import mongoose from "mongoose";
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  connectionId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status_accepted: {
    type: Boolean,
    default: null,
  },
});

const ConnectionRequest = mongoose.model("Connection", connectionSchema);
export default ConnectionRequest;
