import uploadOnCloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const uploadPost = async (req, res) => {
  try {
    const { caption, mediaType } = req.body;
    let media;

    if (req.file) {
      media = await uploadOnCloudinary(req.file.path);
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
    const posts = await Post.find({})
      .populate("author", "name userName profileImage")
      .populate("comments.author", "name userName profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
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
    }

    await post.save();
    await post.populate("author", "name userName profileImage");

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
