// Loops.jsx
import React, { useEffect, useState } from 'react'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoopCard from '../component/LoopCard'

function Loops() {
    const navigate = useNavigate()
    const { loopData } = useSelector(state => state.loop)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const container = document.getElementById("reelScroll")

        const handleScroll = () => {
            const items = document.querySelectorAll(".reel-item")
            let newIndex = activeIndex

            items.forEach((item, index) => {
                const rect = item.getBoundingClientRect()
                if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                    newIndex = index
                }
            })

            if (newIndex !== activeIndex) setActiveIndex(newIndex)
        }

        container.addEventListener("scroll", handleScroll)
        return () => container.removeEventListener("scroll", handleScroll)
    }, [activeIndex])

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
                {loopData.map((loop, index) => (
                    <div key={loop._id || index} className='h-screen snap-start reel-item'>
                        <LoopCard
                            loop={loop}
                            isActive={activeIndex === index}   // ⭐ Only active reel audio
                            onProfileClick={(name) => navigate(`/profile/${name}`)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Loops
