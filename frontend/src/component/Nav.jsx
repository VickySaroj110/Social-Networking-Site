import React from 'react'
import { FiHome } from 'react-icons/fi'
import { FaSearch, FaPlusSquare, FaFilm } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import dp1 from "../assets/dp1.jpeg"

function Nav() {
    const navigate = useNavigate()
    const { userData } = useSelector(state => state.user)

    return (
        <div className='w-[90%] lg:w-[40%] h-[80px] bg-black flex justify-around
            items-center fixed bottom-[20px] rounded-full shadow-2xl shadow-[#000000] z-[100]'
        >
            <FiHome className='text-[white] w-[25px] h-[25px] cursor-pointer' onClick={() => navigate(`/`)}/>
            <FaSearch className='text-[#ffffff] w-[25px] h-[25px] cursor-pointer' />
            <FaPlusSquare className='text-[white] w-[25px] h-[25px] cursor-pointer' onClick={() => navigate(`/upload`)}/>
            <FaFilm className='text-[white] w-[25px] h-[25px] cursor-pointer' onClick={() => navigate(`/loops`)}/>
            <div>
                <div className='w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'
                    onClick={() => navigate(`/profile/${userData.userName}`)}>
                    <img src={userData.profileImage || dp1} alt="" className='w-full h-full object-cover' /> {/* ✅ h-full added */}
                </div>
            </div>
        </div>
    )
}

export default Nav
