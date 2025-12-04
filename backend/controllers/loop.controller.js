import uploadOnCloudinary from "../config/cloudinary.js";
import Loop from "../models/loop.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { io, getreceiverSocketId } from "../config/socket.js";

// Upload Loop
export const uploadLoop = async (req, res) => {
  try {
    const { caption } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "Media is required" });

    const media = await uploadOnCloudinary(req.file.path);

    const loop = await Loop.create({
      caption,
      media,
      author: req.userId,
    });

    const user = await User.findById(req.userId);
    user.loops.push(loop._id);
    await user.save();

    const populatedLoop = await Loop.findById(loop._id).populate(
      "author",
      "name userName profileImage"
    );
    return res.status(201).json(populatedLoop);
  } catch (error) {
    console.error("uploadLoop error:", error);
    return res.status(500).json({ message: `uploadLoop error ${error}` });
  }
};

// Get All Loops with Pagination
export const getAllLoops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const loops = await Loop.find({})
      .populate("author", "name userName profileImage")
      .populate("comments.author", "name userName profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalLoops = await Loop.countDocuments({});
    const totalPages = Math.ceil(totalLoops / limit);

    return res.status(200).json({
      loops,
      totalLoops,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("getAllLoops error:", error);
    return res.status(500).json({ message: `getAllLoops error ${error}` });
  }
};

// Like/Unlike Loop
export const like = async (req, res) => {
  try {
    const { loopId } = req.params;
    const loop = await Loop.findById(loopId);
    if (!loop) return res.status(404).json({ message: "Loop not found" });

    const alreadyLiked = loop.likes.some(
      (id) => id.toString() === req.userId.toString()
    );
    if (alreadyLiked) {
      loop.likes = loop.likes.filter(
        (id) => id.toString() !== req.userId.toString()
      );
      // Remove notification when unliked
      await Notification.findOneAndDelete({
        recipient: loop.author,
        sender: req.userId,
        type: "reel_like",
        reelId: loopId,
      });
    } else {
      loop.likes.push(req.userId);

      // Create notification when liked (but not for self-likes)
      if (loop.author.toString() !== req.userId.toString()) {
        console.log("🔔 Creating notification for reel like");
        const sender = await User.findById(req.userId).select(
          "userName profileImage"
        );

        const notification = new Notification({
          recipient: loop.author,
          sender: req.userId,
          type: "reel_like",
          reelId: loopId,
          message: `liked your reel`,
        });

        await notification.save();
        console.log("✅ Notification saved:", notification._id);

        // Emit socket event for real-time notification
        const receiverSocketId = getreceiverSocketId(loop.author.toString());
        console.log("🔍 Receiver socket ID:", receiverSocketId);

        if (receiverSocketId) {
          const populatedNotification = await Notification.findById(
            notification._id
          )
            .populate("sender", "userName profileImage")
            .populate("reelId", "caption");

          console.log(
            "📤 Emitting notification to socket:",
            populatedNotification
          );
          io.to(receiverSocketId).emit(
            "newNotification",
            populatedNotification
          );
        } else {
          console.log(
            "⚠️ Receiver not online, notification saved but not emitted"
          );
        }
      }
    }

    await loop.save();
    const populatedLoop = await Loop.findById(loopId).populate(
      "author",
      "name userName profileImage"
    );
    return res.status(200).json(populatedLoop);
  } catch (error) {
    console.error("like error:", error);
    return res.status(500).json({ message: `like error ${error}` });
  }
};

// Add Comment
export const comment = async (req, res) => {
  try {
    const { message } = req.body;
    const { loopId } = req.params;

    const loop = await Loop.findById(loopId);
    if (!loop) return res.status(404).json({ message: "Loop not found" });

    loop.comments.push({ author: req.userId, message });
    await loop.save();

    const updatedLoop = await Loop.findById(loopId)
      .populate("author", "name userName profileImage")
      .populate("comments.author", "name userName profileImage");

    return res.status(200).json(updatedLoop);
  } catch (error) {
    console.error("comment error:", error);
    return res.status(500).json({ message: `comment error ${error}` });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { loopId, commentId } = req.params;

    const loop = await Loop.findById(loopId);
    if (!loop) return res.status(404).json({ message: "Loop not found" });

    const comment = loop.comments.find((c) => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.author || comment.author.toString() !== req.userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    loop.comments = loop.comments.filter((c) => c._id.toString() !== commentId);
    await loop.save();

    const updatedLoop = await Loop.findById(loopId)
      .populate("author", "name userName profileImage")
      .populate("comments.author", "name userName profileImage");

    return res
      .status(200)
      .json({ message: "Comment deleted", loop: updatedLoop });
  } catch (error) {
    console.error("deleteComment error:", error);
    return res
      .status(500)
      .json({ message: `delete comment error ${error.message}` });
  }
};

// Delete Loop
export const deleteLoop = async (req, res) => {
  try {
    const { loopId } = req.params;

    const loop = await Loop.findById(loopId);
    if (!loop) return res.status(404).json({ message: "Loop not found" });

    if (loop.author.toString() !== req.userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    await loop.deleteOne();
    await User.findByIdAndUpdate(req.userId, { $pull: { loops: loopId } });

    return res
      .status(200)
      .json({ message: "Loop deleted successfully", loopId });
  } catch (error) {
    console.error("deleteLoop error:", error);
    return res
      .status(500)
      .json({ message: `delete loop error ${error.message}` });
  }
};

// Save / Unsave Loop
export const saveLoop = async (req, res) => {
  try {
    const { loopId } = req.params;
    const user = await User.findById(req.userId);
    const loop = await Loop.findById(loopId);

    if (!loop) {
      return res.status(400).json({ message: "loop not found" });
    }

    const alreadySaved = user.savedLoops.some(
      (id) => id.toString() === loopId.toString()
    );

    if (alreadySaved) {
      user.savedLoops = user.savedLoops.filter(
        (id) => id.toString() !== loopId.toString()
      );
    } else {
      user.savedLoops.push(loopId);
    }

    await user.save();
    await user.populate({
      path: "savedLoops",
      populate: [
        { path: "author", select: "name userName profileImage" },
        { path: "comments.author", select: "name userName profileImage" }
      ],
    });

    return res.status(200).json(user.savedLoops);
  } catch (error) {
    return res.status(500).json({ message: `save loop error ${error}` });
  }
};
