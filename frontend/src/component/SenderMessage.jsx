import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dp from "../assets/dp.png"
import {
    FaHeart,
    FaRegHeart,
    FaRegComment,
    FaRegBookmark,
    FaBookmark,
    FaRegPaperPlane,
    FaTrash
} from "react-icons/fa";
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { serverUrl } from '../App';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';

function SenderMessage({message}) {
  const {userData}=useSelector(state=>state.user)
  const {messages}=useSelector(state=>state.message)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const scroll = useRef()
  const videoRef = useRef()
  const [showComment, setshowComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [postData, setPostData] = useState(message.postId);
  const [loopData, setLoopData] = useState(message.loopId);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareUser, setSelectedShareUser] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  
  useEffect(()=>{
    scroll.current?.scrollIntoView({behavior:"smooth"})
  },[message.message,message.image,message.loopId,message.postId])
  
  // Handle like for shared post/loop
  const handleLike = async () => {
    try {
      if(postData?._id) {
        const res = await axios.get(`${serverUrl}/api/post/like/${postData._id}`, { withCredentials: true });
        // Update the post with new like data
        setPostData(res.data);
      } else if(loopData?._id) {
        const res = await axios.get(`${serverUrl}/api/loop/like/${loopData._id}`, { withCredentials: true });
        // Update the loop with new like data
        setLoopData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Handle comment
  const handleComment = async () => {
    if (!commentMessage.trim()) return;
    try {
      const endpoint = postData?._id 
        ? `${serverUrl}/api/post/comment/${postData._id}`
        : `${serverUrl}/api/loop/comment/${loopData._id}`;
      
      const res = await axios.post(
        endpoint,
        { message: commentMessage },
        { withCredentials: true }
      );
      
      // Update the post/loop with new comment
      if (postData) {
        setPostData(res.data);
      } else if (loopData) {
        setLoopData(res.data);
      }
      
      setCommentMessage("");
      
      // Optionally refetch to ensure latest data across all instances
      console.log("✅ Comment added");
    } catch (error) {
      console.error("❌ Comment error:", error);
    }
  }
  
  // Handle save for shared post/loop
  const handleSaved = async () => {
    try {
      if(postData?._id) {
        await axios.get(`${serverUrl}/api/post/saved/${postData._id}`, { withCredentials: true });

        let updatedSaved = [...userData.saved];
        if (updatedSaved.includes(postData._id)) {
          updatedSaved = updatedSaved.filter(id => id !== postData._id);
        } else {
          updatedSaved.push(postData._id);
        }

        dispatch(setUserData({
          ...userData,
          saved: updatedSaved
        }));
      } else if(loopData?._id) {
        await axios.get(`${serverUrl}/api/loop/save/${loopData._id}`, { withCredentials: true });
        
        let updatedSavedLoops = [...(userData.savedLoops || [])];
        if (updatedSavedLoops.includes(loopData._id)) {
          updatedSavedLoops = updatedSavedLoops.filter(id => id !== loopData._id);
        } else {
          updatedSavedLoops.push(loopData._id);
        }

        dispatch(setUserData({
          ...userData,
          savedLoops: updatedSavedLoops
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Handle delete message
  const handleDeleteMessage = async () => {
    try {
      const res = await axios.delete(`${serverUrl}/api/message/delete/${message._id}`, { withCredentials: true });
      console.log("✅ Message deleted:", res.data);
      
      // Remove message from Redux state
      const updatedMessages = messages.filter(msg => msg._id !== message._id);
      dispatch(setMessages(updatedMessages));
    } catch (error) {
      console.error("❌ Delete message failed:", error.response?.data || error.message);
      alert(`Failed to delete message: ${error.response?.data?.message || error.message}`);
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      if (postData?._id) {
        const res = await axios.delete(
          `${serverUrl}/api/post/comment/${postData._id}/${commentId}`,
          { withCredentials: true }
        );
        // Update local post state with updated post
        setPostData(res.data);
      } else if (loopData?._id) {
        const res = await axios.delete(
          `${serverUrl}/api/loop/comment/${loopData._id}/${commentId}`,
          { withCredentials: true }
        );
        // Update local loop state with updated loop
        setLoopData(res.data.loop);
      }
    } catch (error) {
      console.error("Delete comment failed:", error);
      alert("Failed to delete comment");
    }
  }

  // Get all sharable users
  const getSharableUsers = () => {
    const followers = userData?.followers || []
    const following = userData?.following || []
    const allUsers = [...followers, ...following]
    const uniqueUsers = Array.from(new Map(allUsers.map(u => {
        const userId = u._id || u
        return [userId, typeof u === 'object' ? u : { _id: u, userName: 'User', profileImage: null }]
    })).values())
    return uniqueUsers.filter(u => u._id !== userData?._id)
  }

  // Share post/reel to user
  const handleSharePostToUser = async () => {
    if (!selectedShareUser) return
    try {
      setShareLoading(true)
      await axios.post(
        `${serverUrl}/api/message/send/${selectedShareUser._id}`,
        { [postData ? 'postId' : 'loopId']: post._id },
        { withCredentials: true }
      )
      setShowShareModal(false)
      setSelectedShareUser(null)
      alert("Shared successfully!")
    } catch (error) {
      console.error("Share failed:", error)
      alert("Failed to share")
    } finally {
      setShareLoading(false)
    }
  }

  const post = postData || loopData;
  const isPost = !!postData;
  const isLoop = !!loopData;
  const isLiked = post?.likes?.includes(userData._id);
  const isSaved = isPost ? userData.saved?.includes(post?._id) : userData.savedLoops?.includes(post?._id);
  
  // Handle video play/pause
  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
  };
  
  return (
    <div ref={scroll} className='w-fit max-w-[500px] ml-auto right-0 flex flex-col gap-[10px]'>
      
      {/* SHARE MODAL */}
      {showShareModal && (
        <div className='fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4 rounded-2xl'>
          <div className='bg-white rounded-3xl p-6 max-w-[400px] w-full'>
            <h2 className='text-gray-800 text-xl font-bold mb-4'>Share {isPost ? 'Post' : 'Reel'}</h2>
            <div className='grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto mb-4'>
              {getSharableUsers().map(user => (
                <div
                  key={user._id}
                  onClick={() => setSelectedShareUser(user)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition ${
                    selectedShareUser?._id === user._id
                      ? 'bg-gray-200 border-2 border-gray-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <img
                    src={user.profileImage || dp}
                    alt={user.userName}
                    className='w-16 h-16 rounded-full object-cover border-2 border-gray-400'
                  />
                  <p className='text-gray-800 text-xs text-center truncate w-full'>{user.userName}</p>
                </div>
              ))}
            </div>
            <div className='flex gap-3'>
              <button
                disabled={!selectedShareUser || shareLoading}
                className='flex-1 bg-black text-white py-2 rounded-full font-semibold disabled:opacity-50'
                onClick={handleSharePostToUser}
              >
                {shareLoading ? 'Sending...' : 'Send'}
              </button>
              <button
                className='flex-1 border-2 border-gray-800 text-gray-800 py-2 rounded-full font-semibold'
                onClick={() => {
                  setShowShareModal(false)
                  setSelectedShareUser(null)
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* REEL STYLE - FULL VERTICAL VIEW */}
      {isLoop && post && (
        <div className='w-[400px] h-[600px] flex flex-col gap-0 bg-black rounded-2xl overflow-visible relative group'>
          
          {/* DELETE BUTTON - TOP LEFT */}
          <button
            onClick={handleDeleteMessage}
            className='absolute top-3 left-3 bg-black/50 hover:bg-red-500/70 transition p-[8px] rounded-lg opacity-0 group-hover:opacity-100 z-50 cursor-pointer'
            title="Delete message"
          >
            <FaTrash className='w-[16px] h-[16px] text-white' />
          </button>
          
          {/* MEDIA - FULL HEIGHT */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden rounded-2xl">
            {post.mediaType === "image" ? (
              <img src={post.media} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={post.media}
                  muted={isMuted}
                  playsInline
                  className='h-full w-full object-cover cursor-pointer'
                  onClick={handleVideoClick}
                />
              </>
            )}

            {/* SIDE ACTION BUTTONS - RIGHT SIDE */}
            <div className='absolute right-[15px] bottom-[100px] flex flex-col gap-[20px] z-40'>
              
              {/* Like Button */}
              <div 
                className='flex flex-col items-center gap-[5px] cursor-pointer group'
                onClick={handleLike}
              >
                {!isLiked ? (
                  <FaRegHeart className="w-[30px] h-[30px] text-white group-hover:text-red-500 transition" />
                ) : (
                  <FaHeart className="w-[30px] h-[30px] text-red-500" />
                )}
                <span className='text-white text-xs font-semibold'>{post.likes?.length || 0}</span>
              </div>

              {/* Comment Button */}
              <div 
                className='flex flex-col items-center gap-[5px] cursor-pointer group'
                onClick={() => setshowComment(prev => !prev)}
              >
                <FaRegComment className="w-[30px] h-[30px] text-white group-hover:scale-110 transition" />
                <span className='text-white text-xs font-semibold'>{post.comments?.length || 0}</span>
              </div>

              {/* Share Button */}
              <div 
                onClick={() => setShowShareModal(true)}
                className='flex flex-col items-center gap-[5px] cursor-pointer group'
              >
                <FaRegPaperPlane className="w-[30px] h-[30px] text-white group-hover:scale-110 transition" />
              </div>

              {/* Save Button */}
              <div 
                onClick={handleSaved}
                className='flex flex-col items-center gap-[5px] cursor-pointer group'
              >
                {isSaved ? (
                  <FaBookmark className="w-[30px] h-[30px] text-yellow-400" />
                ) : (
                  <FaRegBookmark className="w-[30px] h-[30px] text-white group-hover:scale-110 transition" />
                )}
              </div>
            </div>

            {/* MUTE BUTTON - TOP RIGHT */}
            {post.mediaType === "video" && (
              <button
                onClick={toggleMute}
                className='absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all z-50'
              >
                {isMuted ? (
                  <FiVolumeX className='w-5 h-5' />
                ) : (
                  <FiVolume2 className='w-5 h-5' />
                )}
              </button>
            )}
          </div>

          {/* BOTTOM INFO SECTION */}
          <div className='bg-black text-white p-[15px] flex flex-col gap-[10px] max-h-[200px] overflow-y-auto'>
            
            {/* AUTHOR */}
            <div 
              onClick={() => navigate(`/profile/${post.author?.userName}`)}
              className='flex items-center gap-[10px] cursor-pointer hover:opacity-80 transition'
            >
              <div className='w-[35px] h-[35px] border-2 border-gray-600 rounded-full overflow-hidden'>
                <img src={post.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
              </div>
              <div className='font-semibold text-sm'>{post?.author?.userName}</div>
            </div>

            {/* CAPTION */}
            {post.caption && (
              <div className='text-xs text-gray-300 line-clamp-2'>{post.caption}</div>
            )}

            {/* COMMENTS SECTION */}
            {showComment && (
              <div className='flex flex-col gap-[10px] border-t border-gray-700 pt-[10px] mt-[10px]'>
                
                {/* Comments List */}
                <div className='flex flex-col gap-[8px] max-h-[100px] overflow-y-auto'>
                  {post.comments?.map((comment, idx) => (
                    <div key={idx} className='flex gap-[8px] items-start'>
                      <div 
                        onClick={() => navigate(`/profile/${comment.author?.userName}`)}
                        className='w-[25px] h-[25px] border border-gray-600 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition'
                      >
                        <img src={comment.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs'>
                          <span className='font-semibold'>{comment.author?.userName}</span>
                          <span className='text-gray-300 ml-[5px]'>{comment.message}</span>
                        </p>
                      </div>
                      {userData._id === comment.author?._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className='text-red-400 text-xs flex-shrink-0 hover:text-red-300'
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Comment Input */}
                <div className='flex gap-[8px] mt-[8px] border-t border-gray-700 pt-[8px]'>
                  <input
                    type="text"
                    placeholder="Comment..."
                    className='flex-1 bg-gray-800 text-white text-xs px-[8px] py-[4px] rounded outline-none'
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentMessage.trim()}
                    className='text-blue-400 text-xs font-semibold disabled:opacity-50'
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST STYLE - WHITE CARD */}
      {isPost && post && (
        <div className='w-full bg-white rounded-2xl shadow-lg overflow-hidden group relative'>
          
          {/* DELETE BUTTON - TOP RIGHT */}
          <button
            onClick={handleDeleteMessage}
            className='absolute top-3 right-3 bg-black/50 hover:bg-red-500/70 transition p-[8px] rounded-lg opacity-0 group-hover:opacity-100 z-50 cursor-pointer'
            title="Delete message"
          >
            <FaTrash className='w-[16px] h-[16px] text-white' />
          </button>
          
          {/* USER HEADER */}
          <div className='w-full flex justify-between items-center px-4 py-3'>
            <div
              onClick={() => navigate(`/profile/${post.author?.userName}`)}
              className='flex items-center gap-4 cursor-pointer hover:opacity-80 transition'
            >
              <div className='w-12 h-12 border-2 border-gray-300 rounded-full overflow-hidden'>
                <img src={post.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
              </div>
              <div className='font-semibold text-gray-800 truncate max-w-[120px]'>
                {post?.author?.userName}
              </div>
            </div>
          </div>

          {/* MEDIA - WITH VIDEO PLAYER */}
          <div className="w-full flex items-center justify-center bg-black relative h-[400px]">
            {post.mediaType === "image" ? (
              <img src={post.media} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={post.media}
                  muted={isMuted}
                  playsInline
                  className='h-full w-full object-cover cursor-pointer'
                  onClick={handleVideoClick}
                />
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  className='absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all z-50'
                >
                  {isMuted ? (
                    <FiVolumeX className='w-5 h-5' />
                  ) : (
                    <FiVolume2 className='w-5 h-5' />
                  )}
                </button>
              </>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className='w-full h-[60px] flex justify-between items-center px-[20px] mt-[10px]'>
            <div className='flex justify-center items-center gap-[10px]'>
              <div className='flex justify-center items-center gap-[5px] cursor-pointer' onClick={handleLike}>
                {!isLiked ? (
                  <FaRegHeart className="w-[25px] h-[25px]" />
                ) : (
                  <FaHeart className="w-[25px] h-[25px] text-red-600" />
                )}
                <span className='text-gray-800'>{post.likes?.length || 0}</span>
              </div>

              <div
                className='flex justify-center items-center gap-[5px] cursor-pointer'
                onClick={() => setshowComment(prev => !prev)}
              >
                <FaRegComment className="w-[25px] h-[25px]" />
                <span className='text-gray-800'>{post.comments?.length || 0}</span>
              </div>

              <div
                className='flex justify-center items-center gap-[5px] cursor-pointer'
                onClick={() => setShowShareModal(true)}
              >
                <FaRegPaperPlane className="w-[25px] h-[25px]" />
              </div>
            </div>

            <div onClick={handleSaved} className='cursor-pointer'>
              {isSaved ? (
                <FaBookmark className="w-[25px] h-[25px] text-yellow-500" />
              ) : (
                <FaRegBookmark className="w-[25px] h-[25px]" />
              )}
            </div>
          </div>

          {/* CAPTION */}
          {post.caption && (
            <div className='w-full px-[20px] gap-[10px] flex justify-start items-center py-2'>
              <h1 className='font-semibold text-gray-800'>{post.author.userName}</h1>
              <div className='text-gray-800'>{post.caption}</div>
            </div>
          )}

          {/* COMMENTS */}
          {showComment && (
            <div className='w-full flex flex-col gap-[15px] pb-[20px]'>
              <div className='w-full flex items-center justify-between px-[20px] py-2'>
                <div className='w-[40px] h-[40px] border-2 border-gray-300 rounded-full overflow-hidden'>
                  <img src={userData?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className='flex-1 mx-[10px] outline-0 border-b-2 border-gray-300 px-[10px] py-1 text-gray-800'
                  value={commentMessage}
                  onChange={(e) => setCommentMessage(e.target.value)}
                />
                <button
                  onClick={handleComment}
                  className='text-blue-600 font-semibold disabled:opacity-50'
                  disabled={!commentMessage}
                >
                  Post
                </button>
              </div>

              <div className='w-full flex flex-col gap-[10px] px-[20px] max-h-[200px] overflow-y-auto'>
                {post.comments?.map((comment, index) => (
                  <div key={index} className='flex gap-[10px]'>
                    <div 
                      onClick={() => navigate(`/profile/${comment.author?.userName}`)}
                      className='w-[30px] h-[30px] border-2 border-gray-300 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition'
                    >
                      <img src={comment.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h1 className='font-semibold text-sm text-gray-800'>{comment.author?.userName}</h1>
                      <p className='text-gray-800 text-sm'>{comment.message}</p>
                    </div>
                    {userData._id === comment.author?._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className='text-red-500 text-xs ml-auto flex-shrink-0 hover:text-red-700'
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* REGULAR MESSAGE TEXT or EMPTY MESSAGE */}
      {(message.message || (!post && !message.image)) && !post && (
        <div className='flex items-end gap-[8px] group'>
          <div className='bg-gradient-to-br from-[#9500ff] to-[#ff0095] rounded-t-2xl rounded-bl-2xl rounded-br-0 px-[15px] py-[10px] text-[16px] text-white max-w-[400px] break-words min-h-[20px]'>
            {message.message || <span className='text-gray-300 text-xs'>(empty message)</span>}
          </div>
          <button
            onClick={handleDeleteMessage}
            className='flex-shrink-0 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-[5px] cursor-pointer z-10'
            title="Delete message"
          >
            <FaTrash className='w-[16px] h-[16px]' />
          </button>
        </div>
      )}
      
      {/* MESSAGE IMAGE */}
      {message.image && !post && (
        <div className='flex flex-col gap-[8px] group relative'>
          <img src={message.image} alt="" className='h-[250px] w-full object-cover rounded-2xl'/>
          <button
            onClick={handleDeleteMessage}
            className='absolute top-2 right-2 bg-black/50 hover:bg-red-500/70 transition p-[8px] rounded-lg opacity-0 group-hover:opacity-100 z-10 cursor-pointer'
            title="Delete message"
          >
            <FaTrash className='w-[16px] h-[16px] text-white' />
          </button>
        </div>
      )}
      
      {/* PROFILE AVATAR */}
      <div className='w-[30px] h-[30px] rounded-full cursor-pointer overflow-hidden ml-auto mt-[5px]'> 
        <img src={userData.profileImage} alt="" className='w-full object-cover'/>
      </div>
    </div>
  )
}

export default SenderMessage
