import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    replies: [replySchema],
  },
  { timestamps: true }
);

const tweetSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, required: true, trim: true, maxlength: 280 },

    // ✅ NEW
    image: { type: String, default: "" },

    // ✅ VERDICT - Fact Check Result
    verdict: {
      type: String,
      enum: ["TRUE", "FALSE", "CHECKING"],
      default: "CHECKING",
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Tweet = mongoose.model("Tweet", tweetSchema);
export default Tweet;
