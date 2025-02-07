import User from "../models/user.model.js";
import Profile from "../models/profile.Model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFdocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connection.model.js";
import { response } from "express";

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFdocument();
  const outPutPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outPutPath);
  doc.pipe(stream);

  // Add image and position it at the top-center
  const imageWidth = 100; // Desired image width
  const pageWidth = doc.page.width; // Total width of the page
  const xPosition = (pageWidth - imageWidth) / 2; // Calculate center position
  const yPosition = 50; // Vertical position for the image
  doc.image(`uploads/${userData.userId.profilePicture}`, xPosition, yPosition, {
    width: imageWidth,
  });

  // Explicitly set the starting point for text after the image
  const textStartY = yPosition + 120; // Adjust to leave space below the image
  doc.fontSize(14).text(`Name: ${userData.userId.name}`, 50, textStartY);
  doc.fontSize(14).text(`UserName: ${userData.userId.userName}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);

  // Add past work details below the user details
  doc.moveDown(5); // Add some space
  doc.fontSize(14).text("Past Work:");
  userData.pastWork.forEach((work) => {
    doc.fontSize(14).text(`Company Name: ${work.company}`);
    doc.fontSize(14).text(`Position: ${work.position}`);
    doc.fontSize(14).text(`Years: ${work.years}`);
  });

  doc.end();
  return outPutPath;
};

// register
export const register = async (req, res) => {
  try {
    const { name, email, password, userName } = req.body;
    console.log(req.body);
    if (!name || !email || !password || !userName) {
      return res.status(400).json({ message: "All Field Are Require " });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      userName,
    });
    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();
    return res.json({ message: "User Created " });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { token });
    return res.json({ token: token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
};

// upload profile picture
export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = req.file.filename;
    await user.save();
    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: req.file.filename,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ message: e.message });
  }
};

// updateUserName and email
export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { userName, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "User allready exists" });
      }
    }
    Object.assign(user, newUserData);
    await user.save();
    return res.json({ messgae: "User updated" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

// getUserAndProfile
export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    // console.log(`Token received: ${token}`);
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ messgae: "User not found" });
    }
    const profile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email userName profilePicture"
    );
    return res.json({ profile });
    // return res.json({ profile: [userProfile] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// updateProfileData
export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(404).json({ messgae: "User not found" });
    }
    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });
    if (!profile_to_update) {
      return res.status(404).json({ message: "Profile not found" });
    }

    Object.assign(profile_to_update, newProfileData);
    await profile_to_update.save();

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status().json({ message: error.message });
  }
};

// searchAllUsers
export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name userName email profilePicture"
    );
    return res.json({ profiles });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// downloadUserProfile
export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name userName email profilePicture"
  );
  let outPutPath = await convertUserDataTOPDF(userProfile);
  return res.json({ message: outPutPath });
};

//sendConnectionRequest
export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection User Not Found" });
    }
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request Already Sent" });
    }
    const Request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await Request.save();
    return res.json({ message: "Request Sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

//getMyConnectionRequest
export const getMyConnectionRequest = async (req, res) => {
  const { token } = req.query;
  // console.log("token:-", token);
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const connection = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name userName email profilePicture");
    return res.json(connection);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
//whatAreMyConnection
export const whatAreMyConnection = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const connection = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name userName email profilePicture");
    return res.json(connection);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
//acceptConnectionRequest
export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const connection = await ConnectionRequest.findOne({ _id: requistId });
    if (!connection) {
      return res.status(404).json({ message: "Connection Not Found" });
    }
    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }
    await connection.save();
    return res.json({ message: "Request Updeted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const userProfileAndUserBasedOnUserName = async (req, res) => {
  const { userName } = req.query;
  try {
    const user = await User.findOne({
      userName,
    });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name userName email profilePicture"
    );
    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
