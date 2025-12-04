import React, { useState, useRef, useEffect } from 'react'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaPlusSquare } from 'react-icons/fa'
import VideoPlayer from '../component/VideoPlayer'
import { serverUrl } from '../App'
import axios from 'axios'
import { setPostData } from '../redux/postSlice'
import { setCurrentUserStory, setStoryData } from '../redux/storySlice'
import { setLoopData } from '../redux/loopSlice'

function Upload() {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { postData } = useSelector(state => state.post)
    const { loopData } = useSelector(state => state.loop)
    const { userData } = useSelector(state => state.user)

    // ⭐⭐⭐ ADDED ⭐⭐⭐
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const tab = params.get("tab")

    const [uploadType, setUploadType] = useState("reel")

    // ⭐⭐⭐ ADDED — Set default tab from URL ⭐⭐⭐
    useEffect(() => {
        if (tab === "post") setUploadType("post")
        else if (tab === "story") setUploadType("story")
        else if (tab === "reel") setUploadType("reel")
    }, [tab])
    // ⭐⭐⭐ END ⭐⭐⭐

    const [frontendMedia, setFrontendMedia] = useState("")
    const [backendMedia, setBackendMedia] = useState("")
    const [mediaType, setMediaType] = useState("")
    const [caption, setCaption] = useState("")
    const [loading, setLoading] = useState(false)

    const mediaInput = useRef()

    const handleMedia = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.type.includes("image")) setMediaType("image")
        else setMediaType("video")
        setBackendMedia(file)
        setFrontendMedia(URL.createObjectURL(file))
    }

    const uploadPost = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("caption", caption)
            formData.append("mediaType", mediaType)
            formData.append("media", backendMedia)
            const result = await axios.post(`${serverUrl}/api/post/upload`, formData, { withCredentials: true })
            // Backend returns populatedPost directly, prepend to existing posts
            dispatch(setPostData([result.data, ...postData]))
            navigate("/")
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const uploadStory = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("mediaType", mediaType)
            formData.append("media", backendMedia)
            const result = await axios.post(`${serverUrl}/api/story/upload`, formData, { withCredentials: true })
            dispatch(setCurrentUserStory(result.data))
            navigate("/")
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const uploadReel = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("caption", caption)
            formData.append("media", backendMedia)
            const result = await axios.post(`${serverUrl}/api/loop/upload`, formData, { withCredentials: true })
            dispatch(setLoopData([...loopData, result.data]))
            navigate("/")
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = () => {
        if (uploadType === "post") uploadPost()
        else if (uploadType === "story") uploadStory()
        else uploadReel()
    }

    return (
        <div className='w-full h-[100vh] bg-black flex flex-col items-center pt-[80px]'>

            <div className='w-full h-[80px] flex fixed top-0 left-0 items-center gap-[20px] px-[20px] z-[50] bg-black'> 
                <MdOutlineKeyboardBackspace 
                    onClick={() => navigate(`/`)}
                    className='text-white cursor-pointer w-[25px] h-[25px]' 
                />
                <h1 className='text-white text-[20px] font-semibold'>Upload</h1>
            </div>

            <div className='w-[90%] max-w-[600px] h-[80px] mt-4 bg-[white] rounded-full flex justify-around items-center gap-[10px]'>

                <div 
                    className={`${uploadType === "post" ? "bg-black text-white shadow-2xl shadow-black" : ""} w-[28%] h-[80%] flex justify-center items-center text-[19px] font-semibold hover:bg-black rounded-full hover:text-white cursor-pointer hover:shadow-2xl hover:shadow-black`} 
                    onClick={() => setUploadType("post")}
                >Post</div>

                <div 
                    className={`${uploadType === "story" ? "bg-black text-white shadow-2xl shadow-black" : ""} w-[28%] h-[80%] flex justify-center items-center text-[19px] font-semibold hover:bg-black rounded-full hover:text-white cursor-pointer hover:shadow-2xl hover:shadow-black`} 
                    onClick={() => setUploadType("story")}
                >Story</div>

                <div 
                    className={`${uploadType === "reel" ? "bg-black text-white shadow-2xl shadow-black" : ""} w-[28%] h-[80%] flex justify-center items-center text-[19px] font-semibold hover:bg-black rounded-full hover:text-white cursor-pointer hover:shadow-2xl hover:shadow-black`} 
                    onClick={() => setUploadType("reel")}
                >Reel</div>

            </div>

            {/* REST OF YOUR UI — NOTHING CHANGED */}
            {/* EXACT SAME CODE BELOW */}
            
            {!frontendMedia && 
                <div className='w-[80%] max-w-[500px] h-[250px] bg-[#0e1316] border-gray-800 border-2 flex flex-col items-center justify-center gap-[8px] mt-[15vh] rounded-2xl cursor-pointer hover:bg-[#353a3d]'
                    onClick={() => mediaInput.current.click()}>
                    <input 
                        type="file" 
                        accept={uploadType === "reel" ? "video/*" : "image/*"} 
                        hidden 
                        ref={mediaInput} 
                        onChange={handleMedia} 
                    />
                    <div><FaPlusSquare className='text-[white] w-[25px] h-[25px] cursor-pointer' /></div>
                    <div className='text-white text-[19px] font-semibold'>Upload {uploadType}</div>
                </div>
            }

            {frontendMedia &&
                <div className='w-[80%] max-w-[500px] h-[250px] flex flex-col items-center justify-center mt-[15vh]'>

                    {mediaType === "image" && 
                        <div className='w-[80%] max-w-[500px] h-[250px] flex flex-col items-center justify-center mt-[5vh]'>
                            <img src={frontendMedia} alt="" className='h-[60%] rounded-2xl' />
                            {uploadType !== "story" && 
                                <input type="text" 
                                    className='w-full border-b-gray-400 border-b-2 outline-none px-[10px] py-[5px] text-white mt-[20px]'
                                    placeholder='write caption' 
                                    onChange={(e) => setCaption(e.target.value)} 
                                    value={caption} 
                                />
                            }
                        </div>
                    }

                    {mediaType === "video" && 
                        <div className='w-[80%] max-w-[500px] h-[250px] flex flex-col items-center justify-center mt-[5vh]'>
                            <VideoPlayer media={frontendMedia} />
                            {uploadType !== "story" && 
                                <input type="text" 
                                    className='w-full border-b-gray-400 border-b-2 outline-none px-[10px] py-[5px] text-white mt-[20px]'
                                    placeholder='write caption' 
                                    onChange={(e) => setCaption(e.target.value)} 
                                    value={caption} 
                                />
                            }
                        </div>
                    }

                </div>
            }

            {frontendMedia &&
                <button 
                    className='px-[10px] w-[60%] max-w-[400px] py-[5px] h-[50px] bg-[white] mt-[50px] cursor-pointer rounded-2xl flex justify-center items-center'
                    onClick={handleUpload} 
                    disabled={loading}
                >
                    {loading 
                        ? <div className='loader border-t-2 border-b-2 border-black w-[20px] h-[20px] rounded-full animate-spin'></div> 
                        : `Upload ${uploadType}`
                    }
                </button>
            }
        </div>
    )
}

export default Upload
