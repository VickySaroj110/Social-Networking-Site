import uploadOnCloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { io } from "../config/socket.js";

export const uploadPost = async (req, res) => {
  try {
    const { caption, mediaType } = req.body;
    let media;

    if (req.file) {
      const cloudinaryResult = await uploadOnCloudinary(req.file.path);
      media = cloudinaryResult.secure_url;
    } else {
      return res.status(400).json({ message: "media is required" });
    }

    const post = await Post.create({
      caption,
      media,
      mediaType,
      author: req.userId,
    });

    const user = await User.findById(req.userId);
    user.posts.push(post._id);
    await user.save();

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name userName profileImage"
    );

    return res.status(201).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: `uploadPost error ${error}` });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .populate("author", "name userName profileImage")
      .populate("comments.author", "name userName profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({});
    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      posts,
      totalPosts,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    });
  } catch (error) {
    return res.status(500).json({ message: `getAllPost error ${error}` });
  }
};

export const like = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.userId.toString()
      );
    } else {
      post.likes.push(req.userId);
      
      // Create notification when someone likes the post
      if (post.author.toString() !== req.userId.toString()) {
        const liker = await User.findById(req.userId);
        const notification = await Notification.create({
          recipient: post.author,
          sender: req.userId,
          type: "post_like",
          postId: postId,
          message: `${liker.userName} liked your post`,
        });

        // Emit notification via socket
        io.to(post.author.toString()).emit("newNotification", {
          _id: notification._id,
          sender: {
            _id: liker._id,
            userName: liker.userName,
            profileImage: liker.profileImage,
          },
          type: "post_like",
          message: `${liker.userName} liked your post`,
          read: false,
          createdAt: notification.createdAt,
        });
      }
    }

    await post.save();
    await post.populate("author", "name userName profileImage");
    await post.populate("comments.author", "name userName profileImage");

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: `like error ${error}` });
  }
};

export const comment = async (req, res) => {
  try {
    const { message } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }

    post.comments.push({
      author: req.userId,
      message,
    });

    await post.save();
    await post.populate("author", "name userName profileImage");
    await post.populate("comments.author", "name userName profileImage");

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: `comments error ${error}` });
  }
};

// ✅ Save / Unsave Post
export const saved = async (req, res) => {
  try {
    const postId = req.params.postId;

    const user = await User.findById(req.userId);
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }

    const alreadySaved = user.saved.some(
      (id) => id.toString() === postId.toString()
    );

    if (alreadySaved) {
      user.saved = user.saved.filter(
        (id) => id.toString() !== postId.toString()
      );
    } else {
      user.saved.push(postId);
    }

    await user.save();
    await user.populate({
      path: "saved",
      populate: { path: "author", select: "name userName profileImage" },
    });

    return res.status(200).json(user.saved);
  } catch (error) {
    return res.status(500).json({ message: `saved error ${error}` });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.find(c => c._id.toString() === commentId.toString());
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "You cannot delete this comment" });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId.toString());
    await post.save();

    await post.populate("author", "name userName profileImage");
    await post.populate("comments.author", "name userName profileImage");

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: `comment delete error ${error}` });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "You cannot delete this post" });
    }

    const user = await User.findById(req.userId);
    user.posts = user.posts.filter(id => id.toString() !== postId.toString());
    await user.save();

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `delete error ${error}` });
  }
};
