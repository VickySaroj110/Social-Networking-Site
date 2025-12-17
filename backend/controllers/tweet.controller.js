import Tweet from "../models/tweet.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const createTweet = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Tweet text is required" });
    }

    let imageUrl = "";
    if (req.file) {
      const uploadResponse = await uploadOnCloudinary(req.file.path);
      imageUrl = uploadResponse.secure_url;
    }

    const tweet = await Tweet.create({
      author: req.userId,
      text: text.trim(),
      image: imageUrl || "",
    });

    const populated = await Tweet.findById(tweet._id).populate(
      "author",
      "name userName profileImage"
    );

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: `createTweet error: ${error}` });
  }
};

export const getFeedTweets = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 50);
    const skip = (page - 1) * limit;

    const tweets = await Tweet.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    return res.status(200).json(tweets);
  } catch (error) {
    return res.status(500).json({ message: `getFeedTweets error: ${error}` });
  }
};

export const getTweetById = async (req, res) => {
  try {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    return res.status(200).json(tweet);
  } catch (error) {
    return res.status(500).json({ message: `getTweetById error: ${error}` });
  }
};

export const updateTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const { text } = req.body;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    if (String(tweet.author) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    tweet.text = (text || "").trim();
    if (!tweet.text)
      return res.status(400).json({ message: "Tweet text is required" });

    await tweet.save();

    const populated = await Tweet.findById(tweet._id)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: `updateTweet error: ${error}` });
  }
};

export const deleteTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    if (String(tweet.author) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json({ message: "Tweet deleted" });
  } catch (error) {
    return res.status(500).json({ message: `deleteTweet error: ${error}` });
  }
};

export const toggleLikeTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    const userId = String(req.userId);
    const alreadyLiked = tweet.likes.some((id) => String(id) === userId);

    if (alreadyLiked) {
      tweet.likes = tweet.likes.filter((id) => String(id) !== userId);
    } else {
      tweet.likes.push(req.userId);
    }

    await tweet.save();

    const populated = await Tweet.findById(tweet._id)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    return res.status(200).json({ liked: !alreadyLiked, tweet: populated });
  } catch (error) {
    return res.status(500).json({ message: `toggleLikeTweet error: ${error}` });
  }
};

export const addComment = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    tweet.comments.push({ author: req.userId, text: text.trim(), replies: [] });
    await tweet.save();

    const populated = await Tweet.findById(tweet._id)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: `addComment error: ${error}` });
  }
};

export const addReply = async (req, res) => {
  try {
    const { tweetId, commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    const comment = tweet.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ author: req.userId, text: text.trim() });
    await tweet.save();

    const populated = await Tweet.findById(tweet._id)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: `addReply error: ${error}` });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { tweetId, commentId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    const comment = tweet.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (
      String(comment.author) !== String(req.userId) &&
      String(tweet.author) !== String(req.userId)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.deleteOne();
    await tweet.save();

    const populated = await Tweet.findById(tweet._id)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: `deleteComment error: ${error}` });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { tweetId, commentId, replyId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    const comment = tweet.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (
      String(reply.author) !== String(req.userId) &&
      String(tweet.author) !== String(req.userId)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    reply.deleteOne();
    await tweet.save();

    const populated = await Tweet.findById(tweet._id)
      .populate("author", "name userName profileImage userName")
      .populate("comments.author", "name userName profileImage")
      .populate("comments.replies.author", "name userName profileImage");

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: `deleteReply error: ${error}` });
  }
};
