import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setFollowing, setUserData } from '../redux/userSlice'
import { setCurrentUserStory } from '../redux/storySlice'

function getCurrentUser() {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/currentuser`, { withCredentials: true })
                dispatch(setUserData(result.data))
                
                // Extract IDs from following array (since API returns full user objects)
                const followingIds = result.data.following?.map(user => 
                    typeof user === 'object' ? user._id : user
                ) || []
                dispatch(setFollowing(followingIds))
                
                dispatch(setCurrentUserStory(result.data.story || []))
            } catch (error) {
                console.log("getCurrentUser error:", error)
            }
        }
        fetchUser()
    }, [])
}

export default getCurrentUser
