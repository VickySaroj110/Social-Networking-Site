import mongoose from "mongoose";

// Comment sub-schema
const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { _id: true }); // important: each comment has unique _id

// Loop schema
const loopSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    media: {
        type: String,
        required: true
    },
    caption: {
        type: String,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    comments: {
        type: [commentSchema],
        default: []
    }
}, { timestamps: true });

const Loop = mongoose.model("Loop", loopSchema);
export default Loop;
