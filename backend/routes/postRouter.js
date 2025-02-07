import { Router } from "express";
import multer from "multer";
import {
  creatPost,
  getAllPost,
  deletePost,
  commentPost,
  get_all_comment,
  delete_comment,
  likes_in_post,
} from "../controller/postController.js";
const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "uploads/");
  },
  filename: (req, file, cd) => {
    cd(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.route("/post").post(upload.single("media"), creatPost);
router.route("/posts").get(getAllPost);
router.route("/post_deleted").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_all_comment);
router.route("/delete_commenrt").delete(delete_comment);
router.route("/inc_likes").post(likes_in_post);

export default router;
