import React, { useEffect, useRef, useState } from 'react'
import { FiVolume2, FiVolumeX } from 'react-icons/fi'
import dp from "../assets/dp.png"
import FollowButton from './FollowButton'
import { FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane, FaBookmark, FaRegBookmark } from "react-icons/fa"
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { setLoopData } from '../redux/loopSlice'
import { setUserData } from '../redux/userSlice'
import axios from 'axios'

function LoopCard({ loop, onProfileClick, onLoopUpdate, onLoopSaved }) {
    const videoRef = useRef()
    const commentRef = useRef()
    const dispatch = useDispatch()

    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [message, setMessage] = useState("")
    const [showComment, setShowComment] = useState(false)
    const [progress, setProgress] = useState(0)
    const [showHeart, setShowHeart] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [selectedShareUser, setSelectedShareUser] = useState(null)
    const [shareLoading, setShareLoading] = useState(false)
    const [expandCaption, setExpandCaption] = useState(false)

    const { userData } = useSelector(state => state.user)
    const { loopData } = useSelector(state => state.loop)

    // Sync local saved state with Redux userData
    useEffect(() => {
        const isSavedInRedux = userData?.savedLoops?.includes(loop._id);
        setIsSaved(isSavedInRedux || false)
    }, [userData, loop._id])

    const HandleTimeUpdate = () => {
        const video = videoRef.current
        if (video?.duration) setProgress((video.currentTime / video.duration) * 100)
    }

    // ✅ FIXED: Play + Auto Unmute
    const handleClick = () => {
        const video = videoRef.current
        if (!video) return
        
        if (isPlaying) {
            video.pause()
            setIsPlaying(false)
        } else {
            video.play().catch(() => {})
            setIsPlaying(true)
            // ✅ AUTO UNMUTE WHEN USER CLICKS TO PLAY
            if (videoRef.current) {
                video.muted = false
                setIsMuted(false)
            }
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentRef.current && !commentRef.current.contains(event.target)) {
                setShowComment(false)
            }
        }

        if (showComment) document.addEventListener("mousedown", handleClickOutside)
        else document.removeEventListener("mousedown", handleClickOutside)

        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [showComment])

    // ✅ FIXED: IntersectionObserver - Auto play with sound ONLY when visible
    useEffect(() => {
        let observer;
        
        const pauseAllOtherVideos = () => {
            const allVideos = document.querySelectorAll('video');
            allVideos.forEach(vid => {
                if (vid !== videoRef.current) {
                    vid.pause();
                    vid.muted = true; // Mute other videos
                }
            });
        };

        observer = new IntersectionObserver(([entry]) => {
            const video = videoRef.current;
            if (!video) return;

            // Only autoplay and unmute if the video is actually visible in viewport
            if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
                video.play().catch(() => {});
                setIsPlaying(true);
                // ✅ AUTO UNMUTE ON VIEWPORT ENTRY (70% visible)
                video.muted = false;
                setIsMuted(false);
                pauseAllOtherVideos();
            } else {
                video.pause();
                setIsPlaying(false);
                // ✅ MUTE when not in view
                video.muted = true;
                setIsMuted(true);
            }
        }, { 
            threshold: [0, 0.5, 0.7, 1],
            rootMargin: '-10% 0px -10% 0px'
        });

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
            observer?.disconnect();
        };
    }, []);

    // ✅ FIXED: Mute toggle - ONLY manual toggle
    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (videoRef.current) {
            videoRef.current.muted = newMutedState;
        }
    };

    // Rest of functions same...
    const handleLike = async () => {
        try {
            await axios.get(`${serverUrl}/api/loop/like/${loop._id}`, { withCredentials: true })
            // Toggle like in local state
            const updatedLoop = {
                ...loop,
                likes: loop.likes?.includes(userData._id) 
                    ? loop.likes.filter(id => id !== userData._id)
                    : [...(loop.likes || []), userData._id]
            }
            const updatedLoopData = loopData.map(l => 
                l._id === loop._id ? updatedLoop : l
            )
            dispatch(setLoopData(updatedLoopData))
            // Call callback if provided (for Profile page)
            if (onLoopUpdate) {
                onLoopUpdate(updatedLoop)
            }
        } catch (error) {
            console.error("Like failed:", error)
        }
    }

    const handleLikeOnDoubleClick = () => {
        setShowHeart(true)
        setTimeout(() => setShowHeart(false), 600)
        if (!loop.likes?.includes(userData._id)) handleLike()
    }

    const handleComment = async () => {
        if (!message.trim()) return
        try {
            const commentRes = await axios.post(`${serverUrl}/api/loop/comment/${loop._id}`, { message }, { withCredentials: true })
            // Update Redux with the updated loop data
            const updatedLoopData = loopData.map(l => 
                l._id === loop._id ? commentRes.data : l
            )
            dispatch(setLoopData(updatedLoopData))
            // Call callback if provided (for Profile page)
            if (onLoopUpdate) {
                onLoopUpdate(commentRes.data)
            }
            setMessage("")
        } catch (error) {
            console.error("Comment failed:", error)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${serverUrl}/api/loop/comment/${loop._id}/${commentId}`, { withCredentials: true })
            // Update Redux with deleted comment removed
            const updatedLoop = {
                ...loop,
                comments: loop.comments.filter(c => c._id !== commentId)
            }
            const updatedLoopData = loopData.map(l => 
                l._id === loop._id ? updatedLoop : l
            )
            dispatch(setLoopData(updatedLoopData))
            // Call callback if provided (for Profile page)
            if (onLoopUpdate) {
                onLoopUpdate(updatedLoop)
            }
        } catch (error) {
            console.error("Delete comment failed:", error)
        }
    }

    const handleSaveLoop = async () => {
        try {
            // Update local state immediately for instant UI feedback
            setIsSaved(!isSaved)
            
            await axios.get(`${serverUrl}/api/loop/save/${loop._id}`, { withCredentials: true })

            let updatedSavedLoops = [...(userData.savedLoops || [])]
            const wasInArray = updatedSavedLoops.includes(loop._id)
            
            if (wasInArray) {
                updatedSavedLoops = updatedSavedLoops.filter(id => id !== loop._id)
            } else {
                updatedSavedLoops.push(loop._id)
            }

            dispatch(setUserData({
                ...userData,
                savedLoops: updatedSavedLoops
            }))

            // If it was in array and we removed it, call unsave callback
            if(onLoopSaved) onLoopSaved(wasInArray ? { _id: loop._id, action: 'unsave' } : { ...loop })
        } catch (error) {
            // Revert local state if API fails
            setIsSaved(!isSaved)
            console.error("Save loop failed:", error)
        }
    }

    const handleDeleteLoop = async () => {
        try {
            await axios.delete(`${serverUrl}/api/loop/${loop._id}`, { withCredentials: true })
            // Remove loop from Redux
            const updatedLoopData = loopData.filter(l => l._id !== loop._id)
            dispatch(setLoopData(updatedLoopData))
        } catch (error) {
            console.error("Delete loop failed:", error)
        }
    }

    // Share reel
    const handleShareReel = async () => {
        if (!selectedShareUser) return
        try {
            setShareLoading(true)
            await axios.post(
                `${serverUrl}/api/message/send/${selectedShareUser._id}`,
                { loopId: loop._id },
                { withCredentials: true }
            )
            setShowShareModal(false)
            setSelectedShareUser(null)
        } catch (error) {
            console.error("Share failed:", error)
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
        <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden'>

            {/* DOUBLE TAP HEART */}
            {showHeart && (
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 heart-animation z-50'>
                    <FaHeart className="w-[100px] h-[100px] drop-shadow-2xl text-white" />
                </div>
            )}

            {/* SHARE MODAL */}
            {showShareModal && (
                <div className='absolute inset-0 z-[300] bg-black/60 flex items-center justify-center p-4 rounded-2xl'>
                    <div className='bg-[#0e1718] rounded-3xl p-6 max-w-[400px] w-full'>
                        <h2 className='text-white text-xl font-bold mb-4'>Share Reel</h2>
                        <div className='grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto mb-4'>
                            {getSharableUsers().map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => setSelectedShareUser(user)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition ${
                                        selectedShareUser?._id === user._id
                                            ? 'bg-white/30 border-2 border-white'
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    <img
                                        src={user.profileImage || dp}
                                        alt={user.userName}
                                        className='w-16 h-16 rounded-full object-cover border-2 border-gray-400'
                                    />
                                    <p className='text-white text-xs text-center truncate w-full'>{user.userName}</p>
                                </div>
                            ))}
                        </div>
                        <div className='flex gap-3'>
                            <button
                                disabled={!selectedShareUser || shareLoading}
                                className='flex-1 bg-white text-black py-2 rounded-full font-semibold disabled:opacity-50'
                                onClick={handleShareReel}
                            >
                                {shareLoading ? 'Sending...' : 'Send'}
                            </button>
                            <button
                                className='flex-1 border-2 border-white text-white py-2 rounded-full font-semibold'
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

            {/* TOP RIGHT BUTTONS */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-[200]">
                {/* SOUND BUTTON */}
                <div onClick={toggleMute} className="cursor-pointer bg-black/60 hover:bg-black/80 p-2 rounded-lg transition">
                    {!isMuted 
                        ? <FiVolume2 className='w-[24px] h-[24px] text-white' />
                        : <FiVolumeX className='w-[24px] h-[24px] text-white' />
                    }
                </div>

                {loop.author?._id === userData._id && (
                    <button
                        className="bg-red-600/80 hover:bg-red-600 text-white text-[13px] font-semibold px-3 py-2 rounded-lg transition"
                        onClick={handleDeleteLoop}
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* COMMENTS BOX */}
            <div
                ref={commentRef}
                className={`absolute z-[200] bottom-0 w-full h-[500px] shadow-2xl shadow-black
                p-[10px] rounded-t-4xl bg-[#0e1718] transform transition-transform duration-500 ease-in-out left-0
                ${showComment ? "translate-y-0" : "translate-y-[100%]"}`}
            >
                <h1 className='text-white text-[20px] text-center font-semibold'>Comments</h1>

                <div className='w-full h-[350px] overflow-y-auto flex flex-col gap-[20px]'>

                    {(!loop.comments || loop.comments.length === 0) && (
                        <div className='text-center text-white text-[20px] font-semibold mt-[50px]'>
                            No Comments Yet
                        </div>
                    )}

                    {loop.comments?.map((com, idx) => (
                        <div
                            className='w-full flex flex-col gap-[5px] border-b-[1px] border-gray-800 pb-[10px] mt-[10px]'
                            key={com._id || idx}
                        >
                            <div className='flex items-center gap-[10px]'>

                                <div
                                    className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-gray-300 rounded-full overflow-hidden cursor-pointer'
                                    onClick={() => onProfileClick(com.author?.userName)}
                                >
                                    <img 
                                        src={com.author?.profileImage || dp} 
                                        className='w-full h-full object-cover'
                                        alt="Profile"
                                    />
                                </div>

                                <div
                                    className='font-semibold text-white truncate max-w-[120px] md:max-w-[150px] cursor-pointer'
                                    onClick={() => onProfileClick(com.author?.userName)}
                                >
                                    {com?.author?.userName || 'Unknown'}
                                </div>

                                {com.author?._id === userData._id && (
                                    <button
                                        className="text-red-500 ml-auto text-[14px] font-semibold"
                                        onClick={() => handleDeleteComment(com._id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            <div className='text-white pl-[60px]'>{com.message}</div>
                        </div>
                    ))}
                </div>

                <div className='w-full h-[80px] flex items-center justify-between px-[10px] bg-[#0e1718] pt-4'>
                    <div className='w-[40px] h-[40px] md:w-14 md:h-14 border-2 border-gray-300 rounded-full overflow-hidden'>
                        <img src={userData.profileImage || dp} className='w-full h-full object-cover' />
                    </div>

                    <input
                        type="text"
                        className='px-[10px] border-b-2 border-b-gray-500 text-white w-[90%] outline-none h-[40px]'
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        placeholder='write comment...'
                    />

                    {message && (
                        <button onClick={handleComment}>
                            <FaRegPaperPlane className="text-white w-[20px] h-[20px]" />
                        </button>
                    )}
                </div>
            </div>

            {/* VIDEO */}
            <video
                ref={videoRef}
                muted={isMuted}
                loop
                src={loop?.media}
                className='w-full max-h-full'
                onClick={handleClick}
                onTimeUpdate={HandleTimeUpdate}
                onDoubleClick={handleLikeOnDoubleClick}
            />

            {/* PROGRESS BAR */}
            <div className='absolute bottom-0 w-full h-[3px] bg-gray-900'>
                <div
                    className='h-full bg-white transition-all duration-200 ease-linear'
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* BOTTOM INFO */}
            <div className={`w-full absolute bottom-[10px] p-[10px] flex flex-col gap-[10px] transition-all duration-300 ${expandCaption ? 'h-auto max-h-[70vh] overflow-y-auto' : 'h-[100px]'}`}>

                <div className='flex items-center gap-4'>
                    <div
                        className='w-[20px] h-[20px] md:w-[40px] md:h-[40px] border-2 border-gray-300 rounded-full overflow-hidden cursor-pointer'
                        onClick={() => onProfileClick(loop.author.userName)}
                    >
                        <img src={loop.author?.profileImage || dp} className='w-full h-full object-cover' />
                    </div>

                    <div
                        className='font-semibold truncate text-white max-w-[120px] md:max-w-[150px] cursor-pointer'
                        onClick={() => onProfileClick(loop.author.userName)}
                    >
                        {loop?.author?.userName}
                    </div>

                    {loop.author?._id !== userData._id && (
                        <FollowButton
                            targetUserId={loop.author?._id}
                            tailwind={"px-[10px] py-[5px] text-white border-2 text-[14px] rounded-2xl border-white"}
                        />
                    )}
                </div>

                <div className='text-white p-[10px]'>
                    {loop.caption && loop.caption.length > 0 ? (
                        expandCaption ? (
                            <div>
                                <p className='mb-2'>{loop.caption}</p>
                                <button
                                    onClick={() => setExpandCaption(false)}
                                    className='text-blue-400 hover:text-blue-300 text-sm font-semibold'
                                >
                                    See Less
                                </button>
                            </div>
                        ) : (
                            <div className='flex items-start gap-1'>
                                <p className='line-clamp-1 flex-1'>{loop.caption}</p>
                                {loop.caption.length > 50 && (
                                    <button
                                        onClick={() => setExpandCaption(true)}
                                        className='text-blue-400 hover:text-blue-300 text-sm font-semibold whitespace-nowrap ml-2'
                                    >
                                        See More
                                    </button>
                                )}
                            </div>
                        )
                    ) : null}
                </div>
            </div>

            {/* SIDE ACTION BUTTONS - Always visible */}
            <div className='absolute right-0 flex flex-col gap-[20px] text-white bottom-[150px] p-[10px]'>

                <div className='flex flex-col items-center cursor-pointer'>
                    <div onClick={handleLike}>
                        {!loop.likes.includes(userData._id)
                            ? <FaRegHeart className="w-[25px] h-[25px]" />
                            : <FaHeart className="w-[25px] h-[25px] text-red-600" />}
                    </div>
                    <div>{loop.likes.length}</div>
                </div>

                <div className='flex flex-col items-center cursor-pointer'>
                    <div onClick={() => setShowComment(true)}>
                        <FaRegComment className="w-[25px] h-[25px]" />
                    </div>
                    <div><span>{loop.comments.length}</span></div>
                </div>

                <div className='flex flex-col items-center cursor-pointer' onClick={() => setShowShareModal(true)}>
                    <FaRegPaperPlane className="w-[25px] h-[25px]" />
                </div>                            

                <div className='flex flex-col items-center cursor-pointer' onClick={handleSaveLoop}>
                    {isSaved
                        ? <FaBookmark className="w-[25px] h-[25px] text-yellow-500" />
                        : <FaRegBookmark className="w-[25px] h-[25px]" />
                    }
                </div>

            </div>
        </div>
    )
}

export default LoopCard
