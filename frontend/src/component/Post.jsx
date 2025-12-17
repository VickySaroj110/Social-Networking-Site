import React, { useState, useEffect } from 'react'
import dp from "../assets/dp.png"
import SimpleVideoPlayer from './SimpleVideoPlayer';
import {
    FaHeart,
    FaRegHeart,
    FaRegComment,
    FaRegBookmark,
    FaBookmark,
    FaRegPaperPlane
} from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import { setPostData } from '../redux/postSlice';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import FollowButton from './FollowButton';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Post({ post, onUpdate }) {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);
    const { postData } = useSelector(state => state.post);

    const [showComment, setshowComment] = useState(false);
    const [message, setMessage] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedShareUser, setSelectedShareUser] = useState(null);
    const [shareLoading, setShareLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const navigate = useNavigate();

    // Sync local saved state with Redux userData
    useEffect(() => {
        const isSavedInRedux = userData?.saved?.includes(post?._id);
        setIsSaved(isSavedInRedux || false)
    }, [userData, post?._id])

    // ✅ FIXED: Refetch complete data after like
    const handleLike = async () => {
        try {
            await axios.get(`${serverUrl}/api/post/like/${post._id}`, { withCredentials: true });
            // Update local post state instead of refetching all
            const updatedPost = {
                ...post,
                likes: post.likes?.includes(userData._id)
                    ? post.likes.filter(id => id !== userData._id)
                    : [...(post.likes || []), userData._id]
            };
            
            const updatedPostData = postData.map(p => 
                p._id === post._id ? updatedPost : p
            );
            dispatch(setPostData(updatedPostData));
            
            if(onUpdate) onUpdate(updatedPost);
        } catch (error) {
            console.error(error);
        }
    };

    // ✅ FIXED: Refetch complete data after comment
    const handleComment = async () => {
        if(message.trim() === "") return;
        try {
            const commentRes = await axios.post(
                `${serverUrl}/api/post/comment/${post._id}`,
                { message },
                { withCredentials: true }
            );
            
            // Update local post state instead of refetching all
            const updatedPostData = postData.map(p => 
                p._id === post._id ? commentRes.data : p
            );
            dispatch(setPostData(updatedPostData));
            setMessage("");
            setshowComment(true);

            if(onUpdate) onUpdate(commentRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    // SAVE / UNSAVE
    const handleSaved = async () => {
        try {
            // Update local state immediately for instant UI feedback
            setIsSaved(!isSaved);
            
            await axios.get(`${serverUrl}/api/post/saved/${post._id}`, { withCredentials: true });

            let updatedSaved = [...(userData.saved || [])];
            const wasInArray = updatedSaved.includes(post._id);
            
            if (wasInArray) {
                updatedSaved = updatedSaved.filter(id => id !== post._id);
            } else {
                updatedSaved.push(post._id);
            }

            dispatch(setUserData({
                ...userData,
                saved: updatedSaved
            }));

            // If it was in array and we removed it, call unsave callback
            if(onUpdate) onUpdate(wasInArray ? { _id: post._id, action: 'unsave' } : { ...post });
        } catch (error) {
            // Revert local state if API fails
            setIsSaved(!isSaved);
            console.error(error);
        }
    };

    // POST DELETE
    const handleDelete = async (postId) => {
        try {
            const res = await axios.delete(`${serverUrl}/api/post/delete/${postId}`, { withCredentials: true });
            
            // Remove post from Redux instead of refetching all
            const updatedPostData = postData.filter(p => p._id !== postId);
            dispatch(setPostData(updatedPostData));
            toast.success(res.data.message);

            if(onUpdate) onUpdate(null);
        } catch (error) {
            toast.error("Error deleting post");
        }
    };

    // ✅ FIXED: Refetch complete data after comment delete
    const handleCommentDelete = async (postId, commentId) => {
        try {
            await axios.delete(
                `${serverUrl}/api/post/comment/${postId}/${commentId}`,
                { withCredentials: true }
            );
            
            // Update local post state instead of refetching all
            const updatedPostData = postData.map(p => {
                if (p._id === postId) {
                    return {
                        ...p,
                        comments: p.comments.filter(c => c._id !== commentId)
                    };
                }
                return p;
            });
            dispatch(setPostData(updatedPostData));

            if(onUpdate) onUpdate(updatedPostData.find(p => p._id === postId));
        } catch (error) {
            console.error(error);
            toast.error("Error deleting comment");
        }
    };

    // Share post
    const handleSharePost = async () => {
        if (!selectedShareUser) return
        try {
            setShareLoading(true)
            await axios.post(
                `${serverUrl}/api/message/send/${selectedShareUser._id}`,
                { postId: post._id },
                { withCredentials: true }
            )
            setShowShareModal(false)
            setSelectedShareUser(null)
            toast.success("Post shared!")
        } catch (error) {
            console.error("Share failed:", error)
            toast.error("Failed to share post")
        } finally {
            setShareLoading(false)
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

    return (
        <div className='w-[90%] min-h-[450px] pb-[20px] max-w-[500px] flex flex-col gap-4 bg-white items-center shadow-lg shadow-[#00000030] rounded-2xl overflow-y-scroll'>

            {/* SHARE MODAL */}
            {showShareModal && (
                <div className='fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4 rounded-2xl'>
                    <div className='bg-white rounded-3xl p-6 max-w-[400px] w-full'>
                        <h2 className='text-gray-800 text-xl font-bold mb-4'>Share Post</h2>
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
                                onClick={handleSharePost}
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

            {/* USER HEADER */}
            <div className='w-full flex justify-between items-center px-4 py-3'>
                <div
                    className='flex items-center gap-4'
                    onClick={() => navigate(`/profile/${post.author.userName}`)}
                >
                    <div className='w-12 h-12 md:w-14 md:h-14 border-2 border-gray-300 rounded-full cursor-pointer overflow-hidden'>
                        <img src={post.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                    </div>

                    <div className='font-semibold text-gray-800 truncate max-w-[120px] md:max-w-[150px]'>
                        {post?.author?.userName}
                    </div>
                </div>

                {userData._id !== post.author._id &&
                    <FollowButton
                        tailwind={'px-4 md:px-5 py-1 md:py-2 rounded-2xl text-sm md:text-base bg-black text-white hover:bg-gray-800 transition'}
                        targetUserId={post.author._id}
                    />
                }

                {userData._id === post.author._id && (
                    <button
                        onClick={() => handleDelete(post._id)}
                        className='bg-red-600/80 hover:bg-red-600 text-white text-[13px] font-semibold px-3 py-2 rounded-lg transition'
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* MEDIA */}
            <div className="w-full flex items-center justify-center">
                {post.mediaType === "image" && (
                    <img src={post.media} alt="" className="w-full h-full object-cover rounded-2xl" />
                )}
                {post.mediaType === "video" && (
                    <div className="w-full max-w-[500px] h-[500px] flex items-center justify-center">
                        <SimpleVideoPlayer media={post.media} isStory={false} />
                    </div>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div className='w-full h-[60px] flex justify-between items-center px-[20px] mt-[10px]'>
                <div className='flex justify-center items-center gap-[10px]'>
                    <div className='flex justify-center items-center gap-[5px]' onClick={handleLike}>
                        {!post.likes.includes(userData._id) && (
                            <FaRegHeart className="w-[25px] cursor-pointer h-[25px]" />
                        )}
                        {post.likes.includes(userData._id) && (
                            <FaHeart className="w-[25px] cursor-pointer h-[25px] text-red-600" />
                        )}
                        <span>{post.likes.length}</span>
                    </div>

                    <div
                        className='flex justify-center items-center gap-[5px]'
                        onClick={() => setshowComment(prev => !prev)}
                    >
                        <FaRegComment className="w-[25px] cursor-pointer h-[25px]" />
                        <span>{post.comments.length}</span>
                    </div>

                    <div
                        className='flex justify-center items-center gap-[5px] cursor-pointer'
                        onClick={() => setShowShareModal(true)}
                    >
                        <FaRegPaperPlane className="w-[25px] h-[25px]" />
                    </div>
                </div>

                <div onClick={handleSaved}>
                    {isSaved ? (
                        <FaBookmark className="w-[25px] cursor-pointer h-[25px] text-yellow-500" />
                    ) : (
                        <FaRegBookmark className="w-[25px] cursor-pointer h-[25px]" />
                    )}
                </div>
            </div>

            {/* CAPTION */}
            {post.caption && (
                <div className='w-full px-[20px] gap-[10px] flex justify-start items-center'>
                    <h1 className='font-semibold'>{post.author.userName}</h1>
                    <div>{post.caption}</div>
                </div>
            )}

            {/* COMMENTS */}
            {showComment &&
                <div className='w-full flex flex-col gap-[30px] pb-[20px]'>
                    <div className='w-full h-[80px] flex items-center justify-between px-[20px]'>
                        <div className='w-[40px] h-[40px] border-2 border-gray-300 rounded-full overflow-hidden'>
                            <img src={userData?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                        </div>

                        <input
                            type="text"
                            className='px-[10px] border-b-2 border-b-gray-500 w-[90%] outline-none h-[40px]'
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
                            placeholder='write comment...'
                        />

                        <button onClick={handleComment}>
                            <FaRegPaperPlane className="cursor-pointer w-[20px] h-[20px]" />
                        </button>
                    </div>

                    <div className='w-full max-h-[300px] overflow-auto'>
                        {(!post.comments || post.comments.length === 0) ? (
                            <div className='text-center text-gray-500 py-8'>No comments yet</div>
                        ) : (
                            post.comments.map((com) => (
                                <div key={com._id} className='w-full px-[20px] py-[20px] border-b-2 border-b-gray-200'>
                                    <div className='flex gap-3'>
                                        <div
                                            className='w-[40px] h-[40px] border-2 border-gray-300 rounded-full overflow-hidden cursor-pointer'
                                            onClick={() => navigate(`/profile/${com.author.userName}`)}
                                        >
                                            <img 
                                                src={com.author?.profileImage || dp} 
                                                alt="" 
                                                className='w-full h-full object-cover'
                                            />
                                        </div>

                                        <div className='flex flex-col flex-1 min-w-0'>
                                            <span
                                                className='text-black font-medium cursor-pointer truncate'
                                                onClick={() => navigate(`/profile/${com.author.userName}`)}
                                            >
                                                {com.author?.userName || 'Unknown'}
                                            </span>

                                            <span className='text-gray-700'>
                                                {com.message}
                                            </span>
                                        </div>

                                        {userData._id === com.author?._id && (
                                            <button
                                                onClick={() => handleCommentDelete(post._id, com._id)}
                                                className='text-red-500 text-sm ml-auto'
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            }

            <ToastContainer position="top-center" autoClose={2000} />
        </div>
    );
}

export default Post;
