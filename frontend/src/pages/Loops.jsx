// Loops.jsx
import React, { useEffect, useState } from 'react'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { appendLoopData } from '../redux/loopSlice'
import LoopCard from '../component/LoopCard'
import axios from 'axios'
import { serverUrl } from '../App'

function Loops() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loopData, hasMore, currentPage } = useSelector(state => state.loop)
    const [activeReelId, setActiveReelId] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const container = document.getElementById("reelScroll")

        const handleScroll = () => {
            const items = document.querySelectorAll(".reel-item")
            let newActiveId = activeReelId

            items.forEach((item) => {
                const rect = item.getBoundingClientRect()
                if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                    newActiveId = item.getAttribute("data-reel-id")
                }
            })

            if (newActiveId !== activeReelId) setActiveReelId(newActiveId)

            // ✅ Infinite scroll - load more when near bottom
            if (container && hasMore && !loading) {
                const scrollHeight = container.scrollHeight
                const scrollTop = container.scrollTop
                const clientHeight = container.clientHeight

                // If user is 500px from bottom, load more
                if (scrollHeight - scrollTop - clientHeight < 500) {
                    loadMoreReels()
                }
            }
        }

        container.addEventListener("scroll", handleScroll)
        return () => container.removeEventListener("scroll", handleScroll)
    }, [activeReelId, hasMore, loading])

    // ✅ Load more reels
    const loadMoreReels = async () => {
        if (loading || !hasMore) return

        setLoading(true)
        try {
            const nextPage = currentPage + 1
            const result = await axios.get(
                `${serverUrl}/api/loop/getAll?page=${nextPage}&limit=10`,
                { withCredentials: true }
            )
            dispatch(appendLoopData(result.data))
        } catch (error) {
            console.error("Error loading more reels:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-screen h-screen bg-black overflow-hidden flex justify-center items-center'>

            {/* Header */}
            <div className='w-full h-[80px] fixed top-[20px] left-[20px] flex items-center gap-[20px] px-[20px] z-[100]'>
                <MdOutlineKeyboardBackspace 
                    onClick={() => navigate('/')}
                    className='text-white cursor-pointer w-[25px] h-[25px]'
                />
                <h1 className='text-white text-[20px] font-semibold'>Reels</h1>
            </div>

            {/* Reel List */}
            <div
                id="reelScroll"
                className='h-[100vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide'
            >
                {loopData.map((loop) => (
                    <div 
                        key={loop._id} 
                        data-reel-id={loop._id}
                        className='h-screen snap-start reel-item'
                    >
                        <LoopCard
                            loop={loop}
                            isActive={activeReelId === loop._id}
                            onProfileClick={(name) => navigate(`/profile/${name}`)}
                        />
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className='h-screen flex items-center justify-center snap-start'>
                        <div className='text-white text-lg'>Loading more reels...</div>
                    </div>
                )}

                {/* End of reels message */}
                {!hasMore && loopData.length > 0 && (
                    <div className='h-screen flex items-center justify-center snap-start'>
                        <div className='text-white text-lg'>No more reels</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Loops
