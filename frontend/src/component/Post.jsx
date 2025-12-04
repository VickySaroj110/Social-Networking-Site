import React, { useState } from 'react'
import dp from "../assets/dp.png"
import VideoPlayer from './VideoPlayer';
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

    const navigate = useNavigate();

    // ✅ FIXED: Refetch complete data after like
    const handleLike = async () => {
        try {
            await axios.get(`${serverUrl}/api/post/like/${post._id}`, { withCredentials: true });
            // Refetch ALL posts with complete data
            const result = await axios.get(`${serverUrl}/api/post/getAll`, { withCredentials: true });
            dispatch(setPostData(result.data));
            
            if(onUpdate) onUpdate(result.data.find(p => p._id === post._id));
        } catch (error) {
            console.error(error);
        }
    };

    // ✅ FIXED: Refetch complete data after comment
    const handleComment = async () => {
        if(message.trim() === "") return;
        try {
            await axios.post(
                `${serverUrl}/api/post/comment/${post._id}`,
                { message },
                { withCredentials: true }
            );
            
            // Refetch ALL posts with complete data
            const result = await axios.get(`${serverUrl}/api/post/getAll`, { withCredentials: true });
            dispatch(setPostData(result.data));
            setMessage("");
            setshowComment(true);

            if(onUpdate) onUpdate(result.data.find(p => p._id === post._id));
        } catch (error) {
            console.error(error);
        }
    };

    // SAVE / UNSAVE
    const handleSaved = async () => {
        try {
            await axios.get(`${serverUrl}/api/post/saved/${post._id}`, { withCredentials: true });

            let updatedSaved = [...userData.saved];
            const isSaving = !updatedSaved.includes(post._id);
            
            if (updatedSaved.includes(post._id)) {
                updatedSaved = updatedSaved.filter(id => id !== post._id);
            } else {
                updatedSaved.push(post._id);
            }

            dispatch(setUserData({
                ...userData,
                saved: updatedSaved
            }));

            // Pass null if unsaving, so Profile can remove it from savedPosts
            if(onUpdate) onUpdate(isSaving ? { ...post } : null);
        } catch (error) {
            console.error(error);
        }
    };

    // POST DELETE
    const handleDelete = async (postId) => {
        try {
            const res = await axios.delete(`${serverUrl}/api/post/delete/${postId}`, { withCredentials: true });
            
            const result = await axios.get(`${serverUrl}/api/post/getAll`, { withCredentials: true });
            dispatch(setPostData(result.data));
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
            
            const result = await axios.get(`${serverUrl}/api/post/getAll`, { withCredentials: true });
            dispatch(setPostData(result.data));

            if(onUpdate) onUpdate(result.data.find(p => p._id === postId));
        } catch (error) {
            console.error(error);
            toast.error("Error deleting comment");
        }
    };

    return (
        <div className='w-[90%] min-h-[450px] pb-[20px] max-w-[500px] flex flex-col gap-4 bg-white items-center shadow-lg shadow-[#00000030] rounded-2xl overflow-y-scroll'>

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
                        className='ml-2 text-red-600 font-semibold'
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
                    <div className="w-full max-w-[500px] flex items-center justify-center">
                        <VideoPlayer media={post.media} />
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
                </div>

                <div onClick={handleSaved}>
                    <FaRegBookmark className="w-[25px] cursor-pointer h-[25px]" />
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
