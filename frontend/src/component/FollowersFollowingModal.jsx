import React from 'react'
import dp from "../assets/dp1.jpeg"
import FollowButton from "./FollowButton"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

function FollowersFollowingModal({ type, users, onClose }) {

  const navigate = useNavigate()
  const { userData } = useSelector(state => state.user)   // ⭐ CURRENT LOGGED-IN USER

  const handleUserClick = (userName) => {
    onClose()
    setTimeout(() => {
      navigate(`/profile/${userName}`)
    }, 150)
  }

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black/70 z-50 flex justify-center items-center'>
      <div className='w-[90%] max-w-[500px] h-[70%] bg-white rounded-xl overflow-y-auto relative p-4'>
        
        {/* HEADER */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>
            {type === "followers" ? "Followers" : "Following"}
          </h2>
          <button className='text-black text-xl font-bold' onClick={onClose}>X</button>
        </div>

        {/* USER LIST */}
        <div className='flex flex-col gap-4'>
          {users && users.length > 0 ? users.map((user) => (
            <div 
              key={user._id}
              className='flex items-center gap-4 justify-between'
            >
              {/* LEFT SIDE */}
              <div
                className='flex items-center gap-4 cursor-pointer'
                onClick={() => handleUserClick(user.userName)}
              >
                <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300'>
                  <img src={user.profileImage || dp} alt="" className='w-full h-full object-cover' />
                </div>

                <div className='flex-1'>
                  <div className='font-semibold text-black'>{user.userName}</div>
                  <div className='text-gray-500 text-sm'>{user.name}</div>
                </div>
              </div>

              {/* RIGHT SIDE — follow button hide for self */}
              {user._id !== userData._id && (
                <FollowButton
                  targetUserId={user._id}
                  tailwind="px-3 py-1 bg-black text-white rounded-lg"
                />
              )}

            </div>
          )) : (
            <div className='text-center text-gray-500 mt-10'>No users found</div>
          )}
        </div>

      </div>
    </div>
  )
}

export default FollowersFollowingModal
