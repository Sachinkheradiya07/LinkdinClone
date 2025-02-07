import { Router } from "express";
import multer from "multer";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionRequest,
  whatAreMyConnection,
  acceptConnectionRequest,
  userProfileAndUserBasedOnUserName,
} from "../controller/user.controller.js";

const router = Router();

// upload profile picture
const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "uploads/");
  },
  filename: (req, file, cd) => {
    cd(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
router
  .route("/upload_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

// register
router.route("/register").post(register);
// login
router.route("/login").post(login);
// updateUserName and email
router.route("/user_update").post(updateUserProfile);
// getUserAndProfile
router.route("/get_user_and_profile").get(getUserAndProfile);
// updateProfileData
router.route("/user/update_profile_data").post(updateProfileData);
// searchAllUsers
router.route("/user/get_all_users").get(getAllUserProfile);
// downloadUserProfile
router.route("/user/download_resume").get(downloadProfile);
//sendConnectionRequest
router.route("/user/send_connection_request").post(sendConnectionRequest);
//getMyConnectionRequest
router.route("/user/getconnectionrequest").get(getMyConnectionRequest);
//whatAreMyConnection
router.route("/user/user_connection_request").get(whatAreMyConnection);
//acceptConnectionRequest
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
//userProfileAndUserBasedOnUserName
// Corrected route definition
router
  .route("/user/get_profile_based_on_username")
  .get(userProfileAndUserBasedOnUserName);

export default router;
