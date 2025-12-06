import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { getAllLoops, uploadLoop, like, comment, deleteComment, deleteLoop, saveLoop } from "../controllers/loop.controller.js"
import User from "../models/user.model.js"
import Loop from "../models/loop.model.js"

const loopRouter = express.Router()

// ⭐ SPECIFIC ROUTES (बिना :id के) पहले आने चाहिए
loopRouter.post("/upload", isAuth, upload.single("media"), uploadLoop)
loopRouter.get("/getAll", isAuth, getAllLoops)
loopRouter.get("/savedLoops", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "savedLoops",
      populate: [
        { path: "author", select: "name userName profileImage" },
        { path: "comments.author", select: "name userName profileImage" }
      ],
    });
    res.status(200).json(user.savedLoops);
  } catch (error) {
    res.status(500).json({ message: `Error fetching saved loops: ${error}` });
  }
});

// ✅ Get all user's loops (for profile page - no pagination limit)
loopRouter.get("/userLoops/:userId", isAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const loops = await Loop.find({ author: userId })
      .populate("author", "name userName profileImage")
      .populate("comments.author", "name userName profileImage")
      .sort({ createdAt: -1 });
    
    res.status(200).json(loops);
  } catch (error) {
    res.status(500).json({ message: `Error fetching user loops: ${error}` });
  }
});

// ⭐ DYNAMIC ROUTES (साथ में :id) आखिर में
loopRouter.get("/like/:loopId", isAuth, like)
loopRouter.get("/save/:loopId", isAuth, saveLoop)
loopRouter.post("/comment/:loopId", isAuth, comment)
loopRouter.delete("/comment/:loopId/:commentId", isAuth, deleteComment)
loopRouter.delete("/:loopId", isAuth, deleteLoop)

export default loopRouter
