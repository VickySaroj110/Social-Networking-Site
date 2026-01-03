import React, { useEffect, useRef, useState } from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dp1 from "../assets/dp1.jpeg";
import { LuImage } from "react-icons/lu";
import { IoMdSend } from "react-icons/io";
import SenderMessage from "../component/SenderMessage";
import ReceiverMessage from "../component/ReceiverMessage";
import { serverUrl } from "../App";
import axios from "axios";
import { setMessages } from "../redux/messageSlice";

function MessageArea() {
  const { selectedUser, messages } = useSelector((state) => state.message);
  const { userData } = useSelector((state) => state.user);

  const [input, setInput] = useState("");
  const [frontendMedia, setFrontendMedia] = useState(null);
  const [backendMedia, setBackendMedia] = useState(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  const imageInput = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesContainerRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // reset
    setBackendMedia(file);
    setFrontendMedia(URL.createObjectURL(file));
  };

  // 🔥 FIX 1 — If user directly opens messageArea without selecting a user
  useEffect(() => {
    if (!selectedUser) {
      navigate("/messages"); // redirect to list page
    }
  }, [selectedUser]);

  // --------------------- SEND MESSAGE ---------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser?._id) return;

    // Validate: must have text or image
    if (!input.trim() && !backendMedia) return;

    try {
      const formData = new FormData();
      if (input.trim()) {
        formData.append("message", input);
      }
      if (backendMedia) {
        formData.append("image", backendMedia);
      }

      console.log("📤 Sending message with:", { 
        hasMessage: !!input.trim(), 
        hasImage: !!backendMedia 
      });

      const res = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Message sent:", res.data);
      dispatch(setMessages([...messages, res.data]));

      setInput("");
      setFrontendMedia(null);
      setBackendMedia(null);
    } catch (error) {
      console.error("❌ Send Message Error:", error.response?.data || error.message);
    }
  };

  // --------------------- GET ALL MESSAGES ---------------------
  const getAllMessages = async () => {
    if (!selectedUser?._id) return;

    try {
      const res = await axios.get(
        `${serverUrl}/api/message/getAll/${selectedUser._id}`,
        { withCredentials: true }
      );

      if (Array.isArray(res.data)) {
        // Always update messages to sync deleted/new messages
        dispatch(setMessages(res.data));
        setLastMessageCount(res.data.length);
      } else {
        dispatch(setMessages([]));
        setLastMessageCount(0);
      }
    } catch (error) {
      console.log("Fetch message error:", error);
      dispatch(setMessages([]));
    }
  };

  useEffect(() => {
    getAllMessages();
  }, [selectedUser]);

  useEffect(() => {
    // Set initial message count when messages change from initial load
    if (messages && lastMessageCount === 0) {
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount]);

  // --------------------- WINDOW FOCUS DETECTION ---------------------
  // Refresh messages when user comes back to the window (tab/window focus)
  useEffect(() => {
    const handleFocus = () => {
      console.log("👁️ Window focused - refreshing messages");
      getAllMessages();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedUser]);

  // --------------------- SCROLL TO LAST MESSAGE ---------------------
  // Smart scroll: Only auto-scroll if user is at the bottom, otherwise respect their scroll position
  const handleScroll = (e) => {
    const container = e.target;
    const isAtBottom = 
      Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 50;
    setUserScrolled(!isAtBottom);
  };

  useEffect(() => {
    // Only auto-scroll to bottom if user hasn't manually scrolled up
    if (!userScrolled && messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [messages]);

  // Reset userScrolled when user scrolls to bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const isAtBottom = 
        Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 50;
      if (isAtBottom) {
        setUserScrolled(false);
      }
    };

    container.addEventListener('scroll', checkScroll);
    return () => container.removeEventListener('scroll', checkScroll);
  }, []);

  // ----------------------------------------------------------
  // --------------------- UI START ---------------------------
  // ----------------------------------------------------------

  if (!selectedUser) return null;

  return (
    <div className="w-full h-[100vh] bg-black flex flex-col relative">

      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-[20px] py-[10px] fixed top-0 z-[100] bg-black">
        <div className="flex items-center gap-[15px]">
          <MdOutlineKeyboardBackspace
            onClick={() => navigate(`/profile/${selectedUser?.userName}`)}
            className="text-white cursor-pointer w-[25px] h-[25px]"
          />
          
          <div
            className="w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden"
            onClick={() => navigate(`/profile/${selectedUser?.userName}`)}
          >
            <img
              src={selectedUser?.profileImage || dp1}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-white text-[16px] font-semibold">
            <div>{selectedUser?.userName}</div>
            <div className="text-[12px] text-gray-400">{selectedUser?.name}</div>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={getAllMessages}
          className="text-white hover:text-blue-400 transition text-[20px]"
          title="Refresh messages"
        >
          ↻
        </button>
      </div>

      {/* MESSAGE SECTION */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 w-full mt-[80px] mb-[100px] px-[40px] overflow-y-auto bg-black flex flex-col gap-[50px] py-[20px]"
      >
        {messages &&
          messages.map((msg, index) =>
            msg.sender === userData?._id ? (
              <SenderMessage key={index} message={msg} />
            ) : (
              <ReceiverMessage key={index} message={msg} />
            )
          )}
      </div>

      {/* INPUT BOX */}
      <div className="w-full h-[100px] fixed bottom-0 z-[100] flex justify-center items-center bg-black border-t border-gray-700">

        <form
          onSubmit={handleSendMessage}
          className="w-[90%] max-w-[800px] h-[80%] rounded-full bg-[#131616] flex items-center gap-[10px] px-[20px] relative"
        >
          {/* IMAGE PREVIEW */}
          {frontendMedia && (
            <div className="w-[100px] rounded-2xl h-[100px] absolute top-[-120px] right-[10px] overflow-hidden">
              <img src={frontendMedia} alt="" className="h-full object-cover" />
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            ref={imageInput}
            hidden
            onChange={handleImage}
          />

          {/* Text Input */}
          <input
            type="text"
            placeholder="Message"
            className="w-full h-full px-[20px] text-[18px] text-white outline-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* Image Button */}
          <div onClick={() => imageInput.current.click()}>
            <LuImage className="w-[28px] h-[28px] text-white" />
          </div>

          {/* Send Button */}
          {(input || frontendMedia) && (
            <button className="w-[60px] h-[40px] rounded-full bg-gradient-to-br from-[#9500ff] to-[#ff0095] flex justify-center items-center cursor-pointer">
              <IoMdSend className="w-[28px] h-[28px] text-white" />
            </button>
          )}
        </form>

      </div>
    </div>
  );
}

export default MessageArea;
