import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setPostData } from '../redux/postSlice'

function getAllpost() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    
    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Fetch all posts (use a large limit to get everything)
                const result = await axios.get(`${serverUrl}/api/post/getAll?page=1&limit=500`, { withCredentials: true })
                dispatch(setPostData(result.data))
            } 
            catch (error) {
                console.log(error)    
            }
        }
        fetchPost()
    }, [dispatch, userData])
}

export default getAllpost