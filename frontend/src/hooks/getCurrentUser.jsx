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
                dispatch(setFollowing(result.data.following || []))
                dispatch(setCurrentUserStory(result.data.story || []))
            } catch (error) {
                console.log("getCurrentUser error:", error)
            }
        }
        fetchUser()
    }, [])
}

export default getCurrentUser
