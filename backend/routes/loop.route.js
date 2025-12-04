import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { getAllLoops, uploadLoop, like, comment, deleteComment, deleteLoop, saveLoop } from "../controllers/loop.controller.js"
import User from "../models/user.model.js"

const loopRouter = express.Router()

loopRouter.post("/upload", isAuth, upload.single("media"), uploadLoop)
loopRouter.get("/getAll", isAuth, getAllLoops)
loopRouter.get("/like/:loopId", isAuth, like)
loopRouter.get("/save/:loopId", isAuth, saveLoop)
loopRouter.post("/comment/:loopId", isAuth, comment)

// Delete Comment
loopRouter.delete("/comment/:loopId/:commentId", isAuth, deleteComment)

// Delete Loop
loopRouter.delete("/:loopId", isAuth, deleteLoop)

// ✅ Saved loops for frontend Profile tab
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

export default loopRouter
