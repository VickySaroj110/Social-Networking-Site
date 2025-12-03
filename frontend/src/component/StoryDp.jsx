import React, { useEffect, useState } from 'react'
import dp1 from "../assets/dp1.jpeg"
import { FiPlusCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { setStoryData } from '../redux/storySlice'
import axios from 'axios'

function StoryDp({ profileImage, userName, story }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const { storyData, storyList } = useSelector(state => state.story)
    const [viewed, setViewed] = useState(false)

    useEffect(() => {
        if(story?.viewers?.some((viewer) => 
            viewer?._id?.toString() === userData._id.toString() || viewer?.toString() === userData._id.toString()
        )){
            setViewed(true)
        } else {
            setViewed(false)
        }
    }, [story, userData, storyData, storyList])
    
    const handleViewers = async () => {
        dispatch(setStoryData(null))
        try {
            const result = await axios.get(`${serverUrl}/api/story/view/${story._id}`, { withCredentials: true })
            dispatch(setStoryData(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    const handleClick = () => {
        // Redirect to upload if no story exists
        if (!story || !story._id) {
            navigate("/upload?tab=story")
            return
        }

        // Otherwise, view story
        handleViewers()
        navigate(`/story/${userName === userData.userName ? userData.userName : userName}`)
    }

    // Only show gradient if story exists
    const borderClass = story && story._id 
        ? (!viewed ? "bg-gradient-to-b from-blue-500 to-blue-950" : "bg-gradient-to-b from-gray-500 to-black-800")
        : "border-2 border-gray-700" // plain border if no story

    return (
        <div className='flex flex-col w-[80px]'>
            <div className={`w-[80px] h-[80px] rounded-full flex justify-center items-center relative ${borderClass}`} 
                onClick={handleClick}
            >
                <div className='w-[70px] h-[70px] rounded-full cursor-pointer overflow-hidden relative'>
                    <img src={profileImage || dp1} alt="" className='w-full h-full object-cover' />

                    {/* Show + icon if no story exists and this is the current user */}
                    {(!story || !story._id) && userName === userData.userName && (
                        <FiPlusCircle 
                            className='absolute bottom-0 right-0 w-[22px] h-[22px] text-black bg-white rounded-full p-[2px] z-10' 
                        />
                    )}
                </div>
            </div>
            <div className='text-[14px] text-center truncate w-full text-white'>{userName}</div>
        </div>
    )
}

export default StoryDp
