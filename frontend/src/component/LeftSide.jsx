import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FaRegHeart } from "react-icons/fa6";
import psync from "../assets/psync.png"
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import OtherUsers from './OtherUsers';
import dp1 from "../assets/dp1.jpeg"

function LeftSide() {
    const { userData, suggestedUser } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [shuffledUsers, setShuffledUsers] = useState([])

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    // Shuffle once when suggestedUser changes
    useEffect(() => {
        if (suggestedUser?.length) {
            const shuffled = [...suggestedUser].sort(() => Math.random() - 0.5).slice(0, 10)
            setShuffledUsers(shuffled)
        }
    }, [suggestedUser])

    return (
        <div className='w-[25%] hidden lg:block min-h-[100vh] bg-black border-r-2 border-gray-900'>
            {/* Top Logo and Heart */}
            <div className='w-full h-[100px] flex items-center justify-between p-[20px]'>
                <img src={psync} alt="logo" className='w-[100px]' />
                <div>
                    <FaRegHeart className='text-white w-[25px] h-[25px]' />
                </div>
            </div>

            {/* User Info */}
            <div className='flex items-center w-full justify-between gap-[10px] px-[10px]'>
                <div className='flex items-center gap-[10px]'>
                    <div className='w-[50px] h-[50px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                        <img src={userData.profileImage || dp1} alt="user dp" className='w-full h-full object-cover' />
                    </div>
                    <div>
                        <div className='text-[18px] text-white font-semibold'>
                            {userData.user?.name || userData.name}
                        </div>
                        <div className='text-[15px] text-gray-400 font-semibold'>
                            {userData.user?.userName || userData.userName}
                        </div>
                    </div>
                </div>
                <div className='text-blue-500 font-semibold cursor-pointer' onClick={handleLogOut}>Log Out</div>
            </div>

            {/* Suggested Users */}
            <div className='w-full flex flex-col gap-[20px] p-[20px] pr-3
                h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700'>
                <h1 className='text-white text-[19px] mt-[10px] mb-[10px]'>Suggested Users</h1>

                {shuffledUsers.map((user, index) => (
                    <OtherUsers key={index} user={user} />
                ))}
            </div>
        </div>
    )
}

export default LeftSide
