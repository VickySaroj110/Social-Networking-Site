import React, { useEffect, useState, useRef } from 'react'
import dp from "../assets/dp.png"
import { useSelector } from 'react-redux'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import VideoPlayer from './VideoPlayer'
import { FaEye, FaTrash } from 'react-icons/fa6'
import axios from "axios"
import { serverUrl } from '../App'

function StoryCard({ storyData }) {
    const [showViewers, setShowViewers] = useState(false)
    const navigate = useNavigate()
    const [progress, setProgress] = useState(0)
    const videoRef = useRef(null)
    const { userData } = useSelector(state => state.user)

    const STORY_DURATION = 5000 // 5 seconds for image story

    // Delete story
    const deleteStoryHandler = async () => {
        try {
            await axios.delete(`${serverUrl}/api/story/delete/${storyData?._id}`, {
                withCredentials: true
            })
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    // Progress handling
    useEffect(() => {
        let interval
        if (storyData?.mediaType === "video") {
            const video = videoRef.current
            if (!video) return

            const updateProgress = () => {
                const percent = (video.currentTime / (video.duration || 1)) * 100
                setProgress(Math.min(percent, 100))
                if (percent >= 100) navigate("/")
            }

            const handleEnded = () => navigate("/")

            video.addEventListener("timeupdate", updateProgress)
            video.addEventListener("ended", handleEnded)

            return () => {
                video.removeEventListener("timeupdate", updateProgress)
                video.removeEventListener("ended", handleEnded)
            }
        } else if (storyData?.mediaType === "image") {
            // Image story: use timer
            let start = Date.now()
            interval = setInterval(() => {
                const elapsed = Date.now() - start
                const percent = (elapsed / STORY_DURATION) * 100
                setProgress(Math.min(percent, 100))
                if (percent >= 100) {
                    clearInterval(interval)
                    navigate("/")
                }
            }, 50)
        }

        return () => clearInterval(interval)
    }, [storyData, navigate])

    return (
        <div className='w-full max-w-[500px] h-[100vh] border-x-2 border-gray-800 pt-[60px] relative flex flex-col justify-center'>
            {/* Top bar */}
            <div className='flex items-center gap-[10px] absolute top-[10px] px-[10px] w-full z-10'>
                <MdOutlineKeyboardBackspace
                    onClick={() => navigate(`/`)}
                    className='text-white cursor-pointer w-[25px] h-[25px]'
                />
                <div
                    className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-gray-300 rounded-full cursor-pointer overflow-hidden'
                    onClick={() => navigate(`/profile/${storyData?.author?.userName}`)}
                >
                    <img
                        src={storyData?.author?.profileImage || dp}
                        alt=""
                        className='w-full h-full object-cover'
                    />
                </div>
                <div
                    className='font-semibold truncate text-white max-w-[150px] cursor-pointer'
                    onClick={() => navigate(`/profile/${storyData?.author?.userName}`)}
                >
                    {storyData?.author?.userName}
                </div>
                {storyData?.author?.userName === userData?.userName && (
                    <div className='absolute top-[5px] right-[10px] z-20'>
                        <FaTrash
                            onClick={deleteStoryHandler}
                            className='text-red-500 cursor-pointer'
                        />
                    </div>
                )}
            </div>

            {/* Story content */}
            {!showViewers && <div className="w-full h-[90vh] flex items-center justify-center">
                {storyData?.mediaType === "image" && (
                    <div className="w-full h-full flex items-center justify-center">
                        <img
                            src={storyData.media}
                            alt=""
                            className="max-w-full max-h-full object-contain rounded-2xl"
                        />
                    </div>
                )}
                {storyData?.mediaType === "video" && (
                    <div className="w-full h-full flex items-center justify-center">
                        <VideoPlayer
                            ref={videoRef}
                            media={storyData.media}
                            className="w-full h-full"
                        />
                    </div>
                )}
            </div>}

            {/* Progress Bar */}
            <div className='absolute top-[10px] w-full h-[3px] bg-gray-900'>
                <div
                    className='h-full bg-white transition-all duration-50 ease-linear'
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Viewers Section */}
            {storyData?.author?.userName === userData?.userName &&
                <div
                    className='absolute flex items-center gap-[10px] w-full cursor-pointer text-white h-[70px] bottom-0 p-2 left-0'
                    onClick={() => setShowViewers(true)}
                >
                    <div className='text-white flex items-center gap-[5px]'>
                        <FaEye /> {storyData?.viewers?.filter(v => v?.userName !== userData?.userName).length || 0}
                    </div>
                    <div className='flex relative'>
                        {storyData?.viewers
                            ?.filter(v => v?.userName !== userData?.userName)
                            .slice(0, 3)
                            .map((viewer, index) => (
                                <div
                                    key={viewer._id || index}
                                    className='w-[30px] h-[30px] border-2 border-black rounded-full cursor-pointer overflow-hidden'
                                    style={{ position: "absolute", left: `${index * 22}px` }}
                                    onClick={() => navigate(`/profile/${viewer.userName}`)}
                                >
                                    <img src={viewer?.profileImage || dp} alt="" className='w-full object-cover' />
                                </div>
                            ))}
                    </div>
                </div>}

            {/* Full Viewers List */}
            {showViewers && <>
                <div
                    className="w-full h-[30%] flex items-center justify-center mt-[100px] py-[30px] cursor-pointer overflow-hidden"
                    onClick={() => setShowViewers(false)}
                >
                    {storyData?.mediaType === "image" && (
                        <img
                            src={storyData?.media}
                            alt=""
                            className="max-w-full max-h-full object-contain rounded-2xl"
                        />
                    )}
                    {storyData?.mediaType === "video" && (
                        <div className="w-full h-full rounded-2xl overflow-hidden">
                            <VideoPlayer
                                ref={videoRef}
                                media={storyData.media}
                                className="w-full h-full"
                            />
                        </div>
                    )}
                </div>

                <div className='w-full h-[70%] border-t-2 border-t-gray-800 p-[20px]'>
                    <div className='text-white flex items-center gap-[10px]'>
                        <FaEye />
                        {storyData?.viewers?.filter(v => v?.userName !== userData?.userName).length || 0}
                        <span>Viewers</span>
                    </div>
                    <div className='w-full max-h-full flex flex-col gap-[10px] overflow-auto pt-[20px]'>
                        {storyData?.viewers
                            ?.filter(v => v?.userName !== userData?.userName)
                            .map((viewer, index) => (
                                <div
                                    key={viewer._id || index}
                                    className='w-full flex items-center gap-[20px] cursor-pointer'
                                    onClick={() => navigate(`/profile/${viewer.userName}`)}
                                >
                                    <div className='w-[40px] h-[40px] border-2 border-gray-300 rounded-full overflow-hidden'>
                                        <img src={viewer?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                                    </div>
                                    <div className='font-semibold truncate text-white max-w-[150px]'>
                                        {viewer?.userName}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </>}
        </div>
    )
}

export default StoryCard
