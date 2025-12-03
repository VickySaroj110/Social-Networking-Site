import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { toggleFollow } from '../redux/userSlice'
import axios from 'axios'

function FollowButton({targetUserId,tailwind,onFollowChange}) {
    const {following} = useSelector(state => state.user)
    const isFollowing = following?.includes(targetUserId)
    const dispatch = useDispatch()
    const handleFollow = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/follow/${targetUserId}`, { withCredentials: true })
            dispatch(toggleFollow(targetUserId))
            if(onFollowChange){
                onFollowChange()
            }
        } catch (error)  {
            console.error("Follow failed:", error)
        }
    }
  return (
    <button className={tailwind} onClick={handleFollow}>
        {isFollowing ? "Following" : "Follow"}
    </button>    
      
 )
}

export default FollowButton
