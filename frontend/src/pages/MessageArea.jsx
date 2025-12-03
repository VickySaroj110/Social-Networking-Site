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

  const imageInput = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    try {
      const formData = new FormData();
      formData.append("message", input);
      if (backendMedia) formData.append("image", backendMedia);

      const res = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(setMessages([...messages, res.data]));

      setInput("");
      setFrontendMedia(null);
      setBackendMedia(null);
    } catch (error) {
      console.log("Send Message Error:", error);
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
        dispatch(setMessages(res.data));
      } else {
        dispatch(setMessages([]));
      }
    } catch (error) {
      console.log("Fetch message error:", error);
      dispatch(setMessages([]));
    }
  };

  useEffect(() => {
    getAllMessages();
  }, [selectedUser]);

  // --------------------- SCROLL TO LAST MESSAGE ---------------------
  const lastMessageRef = useRef(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    if (initialLoad.current) {
      lastMessageRef.current?.scrollIntoView({ behavior: "auto" });
      initialLoad.current = false;
    } else {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ----------------------------------------------------------
  // --------------------- UI START ---------------------------
  // ----------------------------------------------------------

  if (!selectedUser) return null;

  return (
    <div className="w-full h-[100vh] bg-black relative">

      {/* Top bar */}
      <div className="w-full flex items-center gap-[15px] px-[20px] py-[10px] fixed top-0 z-[100] bg-black">
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
            className="w-full object-cover"
          />
        </div>

        <div className="text-white text-[16px] font-semibold">
          <div>{selectedUser?.userName}</div>
          <div className="text-[12px] text-gray-400">{selectedUser?.name}</div>
        </div>
      </div>

      {/* MESSAGE SECTION */}
      <div className="w-full h-[80%] pt-[100px] px-[40px] flex flex-col gap-[50px] overflow-auto bg-black">
        {messages &&
          messages.map((msg, index) =>
            msg.sender === userData?._id ? (
              <SenderMessage key={index} message={msg} />
            ) : (
              <ReceiverMessage key={index} message={msg} />
            )
          )}

        <div ref={lastMessageRef}></div>
      </div>

      {/* INPUT BOX */}
      <div className="w-full h-[80px] fixed bottom-0 flex justify-center items-center bg-black z-[100]">

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
