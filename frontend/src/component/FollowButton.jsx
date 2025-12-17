import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { setFollowing } from '../redux/userSlice'
import axios from 'axios'

function FollowButton({targetUserId, tailwind, onFollowChange}) {
    const { following } = useSelector(state => state.user)
    const isFollowing = following?.includes(targetUserId)
    const dispatch = useDispatch()
    
    const handleFollow = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/user/follow/${targetUserId}`, { withCredentials: true })
            
            // Use the API response to determine the new state
            const isNowFollowing = response.data.following
            
            let updatedFollowing
            if (isNowFollowing) {
                // User is now being followed, add to array
                updatedFollowing = [...(following || []), targetUserId]
            } else {
                // User is now unfollowed, remove from array
                updatedFollowing = following.filter(id => id !== targetUserId)
            }
            
            dispatch(setFollowing(updatedFollowing))
            
            if(onFollowChange){
                onFollowChange()
            }
        } catch (error) {
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
