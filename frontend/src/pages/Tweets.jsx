import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { FaPlus } from "react-icons/fa"; // ✅ ADD

function Tweets() {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

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

  return (
    <div className="w-full h-screen overflow-y-auto bg-black text-white">
      <div className="w-full h-[80px] flex justify-between items-center px-[30px]">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <MdOutlineKeyboardBackspace className="text-white w-[25px] h-[25px]" />
        </div>
        <div className="font-semibold text-[20px]">Tweets</div>
        <div className="w-[25px]" />
      </div>

      <div className="w-full flex justify-center px-3">
        <div className="w-full max-w-[700px]">
          {/* Create Tweet */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full bg-black/40 rounded-xl p-3 outline-none"
              placeholder="What's happening?"
            />

            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <div className="text-gray-400 text-sm">{text.length}/280</div>

              {/* ✅ + icon upload button */}
              <label
                title="Add image"
                className="w-[42px] h-[42px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <FaPlus className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePickImage(e.target.files?.[0])}
                />
              </label>

              <button
                disabled={loading}
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl bg-[#1DA1F2] text-white disabled:opacity-60"
              >
                {loading ? "Posting..." : "Tweet"}
              </button>
            </div>

            {preview && (
              <div className="mt-3 relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-[320px] object-cover rounded-2xl"
                />
                <button
                  onClick={() => handlePickImage(null)}
                  className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-black/60"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Feed */}
          <div className="mt-5 flex flex-col gap-3 pb-24">
            {tweets.map((t) => (
              <div key={t._id} className="bg-[#1a1a1a] rounded-2xl p-4">
                <div className="text-sm text-gray-300">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => goProfile(t.author?.userName)}
                  >
                    @{t.author?.userName}
                  </span>{" "}
                  • {new Date(t.createdAt).toLocaleString()}
                </div>

                <div className="mt-2 text-white whitespace-pre-wrap">{t.text}</div>

                {t.image && (
                  <img
                    src={t.image}
                    alt="tweet"
                    className="mt-3 w-full max-h-[420px] object-cover rounded-2xl"
                  />
                )}

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => toggleLike(t._id)}
                    className="px-3 py-1 rounded-lg bg-white/10"
                  >
                    Like ({t.likes?.length || 0})
                  </button>

                  <button
                    onClick={() => navigate(`/tweet/${t._id}`)}
                    className="px-3 py-1 rounded-lg bg-white/10"
                  >
                    Reply ({t.comments?.length || 0})
                  </button>

                  <button
                    onClick={() => deleteTweet(t._id)}
                    className="px-3 py-1 rounded-lg bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {tweets.length === 0 && (
              <div className="text-gray-400 text-center mt-10">No Tweets Yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tweets;
