import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  addComment,
  addReply,
  createTweet,
  deleteComment,
  deleteTweet,
  deleteReply,
  getFeedTweets,
  getTweetById,
  toggleLikeTweet,
  updateTweet,
} from "../controllers/tweet.controller.js";

const tweetRouter = express.Router();

tweetRouter.get("/feed", isAuth, getFeedTweets);
tweetRouter.get("/:tweetId", isAuth, getTweetById);

// ✅ image + text upload
tweetRouter.post("/", isAuth, upload.single("image"), createTweet);

tweetRouter.put("/:tweetId", isAuth, updateTweet);
tweetRouter.delete("/:tweetId", isAuth, deleteTweet);

tweetRouter.post("/:tweetId/like", isAuth, toggleLikeTweet);

tweetRouter.post("/:tweetId/comment", isAuth, addComment);
tweetRouter.post("/:tweetId/comment/:commentId/reply", isAuth, addReply);
tweetRouter.delete("/:tweetId/comment/:commentId", isAuth, deleteComment);

tweetRouter.delete(
  "/:tweetId/comment/:commentId/reply/:replyId",
  isAuth,
  deleteReply
);

export default tweetRouter;
