import uploadOnCloudinary from "../config/cloudinary.js";
import Loop from "../models/loop.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// Upload Loop
export const uploadLoop = async (req, res) => {
    try {
        const { caption } = req.body;
        if (!req.file) return res.status(400).json({ message: "Media is required" });

        const media = await uploadOnCloudinary(req.file.path);

        const loop = await Loop.create({
            caption,
            media,
            author: req.userId
        });

        const user = await User.findById(req.userId);
        user.loops.push(loop._id);
        await user.save();

        const populatedLoop = await Loop.findById(loop._id).populate("author", "name userName profileImage");
        return res.status(201).json(populatedLoop);
    } catch (error) {
        console.error("uploadLoop error:", error);
        return res.status(500).json({ message: `uploadLoop error ${error}` });
    }
};

// Get All Loops
export const getAllLoops = async (req, res) => {
    try {
        const loops = await Loop.find({})
            .populate("author", "name userName profileImage")
            .populate("comments.author", "name userName profileImage");
        return res.status(200).json(loops);
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

        const alreadyLiked = loop.likes.some(id => id.toString() === req.userId.toString());
        if (alreadyLiked) {
            loop.likes = loop.likes.filter(id => id.toString() !== req.userId.toString());
        } else {
            loop.likes.push(req.userId);
        }

        await loop.save();
        const populatedLoop = await Loop.findById(loopId).populate("author", "name userName profileImage");
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

        const comment = loop.comments.find(c => c._id.toString() === commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (!comment.author || comment.author.toString() !== req.userId.toString())
            return res.status(403).json({ message: "Not authorized" });

        loop.comments = loop.comments.filter(c => c._id.toString() !== commentId);
        await loop.save();

        const updatedLoop = await Loop.findById(loopId)
            .populate("author", "name userName profileImage")
            .populate("comments.author", "name userName profileImage");

        return res.status(200).json({ message: "Comment deleted", loop: updatedLoop });

    } catch (error) {
        console.error("deleteComment error:", error);
        return res.status(500).json({ message: `delete comment error ${error.message}` });
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

        return res.status(200).json({ message: "Loop deleted successfully", loopId });

    } catch (error) {
        console.error("deleteLoop error:", error);
        return res.status(500).json({ message: `delete loop error ${error.message}` });
    }
};
