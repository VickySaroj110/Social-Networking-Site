import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useSelector } from "react-redux";

function TweetDetail() {
  const { tweetId } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [tweet, setTweet] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTweet = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/tweet/${tweetId}`, {
        withCredentials: true,
      });
      setTweet(res.data);
    } catch (e) {
      console.log("fetch tweet error", e);
      setTweet(null);
    }
  };

  useEffect(() => {
    fetchTweet();
  }, [tweetId]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${serverUrl}/api/tweet/${tweetId}/comment`,
        { text: commentText },
        { withCredentials: true }
      );
      setTweet(res.data);
      setCommentText("");
    } catch (e) {
      console.log("add comment error", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      setDeletingId(commentId);
      const res = await axios.delete(
        `${serverUrl}/api/tweet/${tweetId}/comment/${commentId}`,
        { withCredentials: true }
      );
      setTweet(res.data);
    } catch (e) {
      console.log("delete comment error", e);
    } finally {
      setDeletingId(null);
    }
  };

  const goProfile = (userName) => {
    if (!userName) return;
    navigate(`/profile/${userName}`);
  };

  if (!tweet) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        Tweet not found
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-auto bg-black text-white">
      <div className="w-full h-[80px] flex justify-between items-center px-[30px]">
        <div className="cursor-pointer" onClick={() => navigate("/tweets")}>
          <MdOutlineKeyboardBackspace className="text-white w-[25px] h-[25px]" />
        </div>
        <div className="font-semibold text-[20px]">Tweet</div>
        <div className="w-[25px]" />
      </div>

      <div className="w-full flex justify-center px-3">
        <div className="w-full max-w-[700px] pb-24">
          {/* Tweet */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <div className="text-sm text-gray-300">
              <span
                className="cursor-pointer hover:underline"
                onClick={() => goProfile(tweet.author?.userName)}
              >
                @{tweet.author?.userName}
              </span>{" "}
              • {new Date(tweet.createdAt).toLocaleString()}
            </div>
            <div className="mt-2 whitespace-pre-wrap">{tweet.text}</div>
          </div>

          {/* Add Reply (Comment) */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 mt-4">
            <div className="font-semibold mb-2">Reply</div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="w-full bg-black/40 rounded-xl p-3 outline-none"
              placeholder="Write a reply..."
            />
            <div className="flex justify-end mt-3">
              <button
                disabled={loading}
                onClick={addComment}
                className="px-4 py-2 rounded-xl bg-[#1DA1F2] disabled:opacity-60"
              >
                {loading ? "Posting..." : "Reply"}
              </button>
            </div>
          </div>

          {/* Replies list (tweet.comments) */}
          <div className="mt-4 flex flex-col gap-3">
            {(tweet.comments || []).map((c) => {
              const canDelete =
                String(c.author?._id) === String(userData?._id) ||
                String(tweet.author?._id) === String(userData?._id);

              return (
                <div key={c._id} className="bg-[#1a1a1a] rounded-2xl p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-sm text-gray-300">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => goProfile(c.author?.userName)}
                        >
                          @{c.author?.userName}
                        </span>{" "}
                        • {new Date(c.createdAt).toLocaleString()}
                      </div>
                      <div className="mt-2 whitespace-pre-wrap">{c.text}</div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => deleteComment(c._id)}
                        disabled={deletingId === c._id}
                        className="px-3 py-1 rounded-lg bg-red-500/20 disabled:opacity-60"
                      >
                        {deletingId === c._id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {(tweet.comments || []).length === 0 && (
              <div className="text-gray-400 text-center mt-6">No replies yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TweetDetail;
