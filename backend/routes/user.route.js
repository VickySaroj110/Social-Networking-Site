import express from "express";
import {
  editProfile,
  follow,
  getCurrentUser,
  getProfile,
  suggestedUsers,
  getMutualFriends,
} from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/currentuser", isAuth, getCurrentUser);
userRouter.get("/suggested", isAuth, suggestedUsers);
userRouter.get("/mutualfriends", isAuth, getMutualFriends);
userRouter.post(
  "/editProfile",
  isAuth,
  upload.single("profileImage"),
  editProfile
);
userRouter.get("/getProfile/:userName", isAuth, getProfile);
userRouter.get("/follow/:targetUserId", isAuth, follow);

export default userRouter;
