import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import User from "../models/user.model.js";

import { comment, getAllPosts, like, saved, uploadPost, deletePost, deleteComment } from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.post("/upload", isAuth, upload.single("media"), uploadPost);
postRouter.get("/getAll", isAuth, getAllPosts);
postRouter.get("/saved/:postId", isAuth, saved);
postRouter.get("/like/:postId", isAuth, like);
postRouter.post("/comment/:postId", isAuth, comment);
postRouter.delete("/delete/:postId", isAuth, deletePost);
postRouter.delete("/comment/:postId/:commentId", isAuth, deleteComment);

// ✅ Saved posts for frontend Profile tab
postRouter.get("/savedPosts", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "saved",
      populate: { path: "author", select: "name userName profileImage" },
    });

    res.status(200).json(user.saved);
  } catch (error) {
    res.status(500).json({ message: `Error fetching saved posts: ${error}` });
  }
});

export default postRouter;
