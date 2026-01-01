import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { FaImage, FaTrash } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { AiOutlineHeart } from "react-icons/ai";
import defaultDP from "../assets/dp.png";

function Tweets() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [tweets, setTweets] = useState([]);

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(null); // To track which tweet's comments to show
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchFeed = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/tweet/feed`, {
        withCredentials: true,
      });
      setTweets(res.data || []);
    } catch (e) {
      console.log("fetchFeed error", e);
      setTweets([]);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePickImage = (file) => {
    setImage(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
  };

  const handleCreate = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);

      await axios.post(`${serverUrl}/api/tweet`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setText("");
      handlePickImage(null);
      await fetchFeed();
    } catch (e) {
      console.log("create tweet error", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (tweetId) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/tweet/${tweetId}/like`,
        {},
        { withCredentials: true }
      );
      const updated = res.data?.tweet;
      if (!updated) return;
      setTweets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
    } catch (e) {
      console.log("like error", e);
    }
  };

  const deleteTweet = async (tweetId) => {
    try {
      await axios.delete(`${serverUrl}/api/tweet/${tweetId}`, {
        withCredentials: true,
      });
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
    } catch (e) {
      console.log("delete tweet error", e);
    }
  };

  const goProfile = (userName) => {
    if (!userName) return;
    navigate(`/profile/${userName}`);
  };

  const addComment = async (tweetId) => {
    if (!commentText.trim()) return;
    try {
      setCommentLoading(true);
      const res = await axios.post(
        `${serverUrl}/api/tweet/${tweetId}/comment`,
        { text: commentText },
        { withCredentials: true }
      );
      // Update the tweet in the list
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? res.data : t))
      );
      setCommentText("");
    } catch (e) {
      console.log("add comment error", e);
    } finally {
      setCommentLoading(false);
    }
  };

  const deleteComment = async (tweetId, commentId) => {
    try {
      const res = await axios.delete(
        `${serverUrl}/api/tweet/${tweetId}/comment/${commentId}`,
        { withCredentials: true }
      );
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? res.data : t))
      );
    } catch (e) {
      console.log("delete comment error", e);
    }
  };

  return (
    <div className="w-full h-screen overflow-y-auto bg-black text-black">
      <div className="w-full h-[70px] flex justify-between items-center px-[20px] sticky top-0 bg-black/95 backdrop-blur z-10">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <MdOutlineKeyboardBackspace className="text-white w-[25px] h-[25px]" />
        </div>
        <div className="font-bold text-[18px] text-white">Tweets</div>
        <div className="w-[25px]" />
      </div>

      <div className="w-full flex justify-center px-3 py-4">
        <div className="w-full max-w-[700px]">
          {/* ✅ TWITTER-LIKE COMPOSE TWEET - WHITE BACKGROUND */}
          <div className="border-b border-gray-300 bg-white rounded-2xl mb-4">
            <div className="p-4 flex gap-4">
              {/* Profile Image - Current Logged In User's picture */}
              <img
                src={userData?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userData?._id}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />

              <div className="flex-1">
                {/* Textarea - Twitter Style */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={280}
                  rows={3}
                  className="w-full bg-transparent text-xl outline-none placeholder-gray-500 text-black resize-none"
                  placeholder="What's happening?!"
                />

                {/* Image Preview */}
                {preview && (
                  <div className="mt-4 relative">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full max-h-[320px] object-cover rounded-2xl border border-gray-300"
                    />
                    <button
                      onClick={() => handlePickImage(null)}
                      className="absolute top-2 right-2 px-3 py-1 rounded-full bg-black/80 hover:bg-black text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                  {/* Image Upload Icon */}
                  <label className="w-10 h-10 rounded-full hover:bg-blue-100 flex items-center justify-center cursor-pointer transition text-blue-500 hover:text-blue-600">
                    <FaImage className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePickImage(e.target.files?.[0])}
                    />
                  </label>

                  {/* Tweet Button */}
                  <button
                    disabled={loading || !text.trim()}
                    onClick={handleCreate}
                    className={`px-6 py-2 rounded-full font-bold transition text-base ${
                      loading || !text.trim()
                        ? "bg-blue-300 text-white cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {loading ? "Posting..." : "Tweet"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="flex flex-col gap-4 pb-24">
            {tweets.map((t) => (
              <div key={t._id}>
                {/* Tweet - WHITE BACKGROUND */}
                <div className="bg-white rounded-2xl border border-gray-300 p-4 hover:shadow-lg transition">
                  <div className="flex gap-3">
                    {/* Profile Image - Actual user picture */}
                    <img
                      src={t.author?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + t.author?._id}
                      alt="profile"
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      onClick={() => goProfile(t.author?.userName)}
                    />

                    <div className="flex-1">
                      {/* Header with verdict badge */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                          <span
                            className="font-bold hover:underline cursor-pointer text-black"
                            onClick={() => goProfile(t.author?.userName)}
                          >
                            {t.author?.name || "User"}
                          </span>
                          <span className="text-gray-500">@{t.author?.userName}</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(t.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Verdict Badge */}
                        {t.verdict && (
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-xs whitespace-nowrap ${
                              t.verdict === "TRUE"
                                ? "bg-green-100 text-green-700"
                                : t.verdict === "FALSE"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                            title={
                              t.verdict === "CHECKING"
                                ? "Fact-checking in progress..."
                                : t.verdict === "TRUE"
                                ? "Checked - Not misleading"
                                : "Checked - Potentially misleading"
                            }
                          >
                            {t.verdict}
                          </span>
                        )}
                      </div>

                      {/* Tweet Text */}
                      <div className="mt-2 text-black text-base whitespace-pre-wrap">{t.text}</div>

                      {/* Image */}
                      {t.image && (
                        <img
                          src={t.image}
                          alt="tweet"
                          className="mt-3 w-full max-h-[420px] object-cover rounded-2xl border border-gray-300"
                        />
                      )}

                      {/* Actions */}
                      <div className="mt-3 flex justify-between text-gray-500 max-w-sm text-sm">
                        <button
                          onClick={() => setShowComments(showComments === t._id ? null : t._id)}
                          className="group flex items-center gap-2 hover:text-blue-500 transition"
                        >
                          <div className="w-8 h-8 rounded-full group-hover:bg-blue-100 flex items-center justify-center">
                            💬
                          </div>
                          <span>{t.comments?.length || 0}</span>
                        </button>

                        <button
                          onClick={() => toggleLike(t._id)}
                          className="group flex items-center gap-2 hover:text-red-500 transition"
                        >
                          <div className="w-8 h-8 rounded-full group-hover:bg-red-100 flex items-center justify-center">
                            ❤️
                          </div>
                          <span>{t.likes?.length || 0}</span>
                        </button>

                        <button
                          onClick={() => deleteTweet(t._id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-100 rounded px-2 py-1 transition"
                          title="Delete tweet"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section - WHITE BACKGROUND */}
                {showComments === t._id && (
                  <div className="bg-white rounded-2xl border border-gray-300 border-t-0 p-4 -mt-1">
                    {/* Add Comment */}
                    <div className="flex gap-3 pb-4 border-b border-gray-200">
                      <img
                        src={userData?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userData?._id}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          maxLength={280}
                          rows={2}
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 outline-none resize-none placeholder-gray-400 text-black text-sm"
                          placeholder="Reply to this tweet..."
                        />
                        <button
                          disabled={commentLoading || !commentText.trim()}
                          onClick={() => addComment(t._id)}
                          className={`mt-2 px-4 py-1 rounded-full font-bold text-sm transition ${
                            commentLoading || !commentText.trim()
                              ? "bg-blue-300 text-white cursor-not-allowed"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          {commentLoading ? "Replying..." : "Reply"}
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="mt-4 space-y-3">
                      {t.comments && t.comments.length > 0 ? (
                        t.comments.map((comment) => (
                          <div key={comment._id} className="flex gap-2 text-sm">
                            <img
                              src={comment.author?.profileImage || defaultDP}
                              alt="profile"
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                              onClick={() => goProfile(comment.author?.userName)}
                            />
                            <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <span
                                  className="font-bold text-black hover:underline cursor-pointer"
                                  onClick={() => goProfile(comment.author?.userName)}
                                >
                                  {comment.author?.name}
                                </span>
                                {userData?._id === comment.author?._id && (
                                  <button
                                    onClick={() => deleteComment(t._id, comment._id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded px-2 py-1 transition"
                                    title="Delete comment"
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="text-gray-700 mt-1">{comment.text}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-4">No replies yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {tweets.length === 0 && (
              <div className="text-gray-400 text-center mt-16 text-lg">
                📭 No tweets yet. Be the first to tweet!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tweets;
