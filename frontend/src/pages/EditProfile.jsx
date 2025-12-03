import React, { useRef, useState } from 'react'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dp1 from "../assets/dp1.jpeg"
import { serverUrl } from '../App'
import { setProfileData, setUserData } from '../redux/userSlice'
import axios from 'axios'

function EditProfile() {
    const [loading, setLoading] = useState(false)
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const imageInput = useRef()
    const [frontendImage, setfrontendImage] = useState(userData.profileImage || dp1)
    const [backendImage, setbackendImage] = useState(null)
    const [name, setName] = useState(userData.name || "")
    const [userName, setuserName] = useState(userData.userName || "")
    const [bio, setBio] = useState(userData.bio || "")
    const [profession, setProfession] = useState(userData.profession || "")

    const handleImage = (e) => {
        const file = e.target.files[0]
        setbackendImage(file)
        setfrontendImage(URL.createObjectURL(file))
    }

    const handleEditProfile = async () => {
        setLoading(true)
        try {
            const formdata = new FormData()
            formdata.append("name", name)
            formdata.append("userName", userName)
            formdata.append("bio", bio)
            formdata.append("profession", profession)
            if (backendImage) {
                formdata.append("profileImage", backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/user/editProfile`, formdata, {
                withCredentials: true, 
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            dispatch(setProfileData(result.data))
            dispatch(setUserData(result.data))
            navigate(`/profile/${userData.userName}`)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full min-h-[100vh] bg-black flex items-center flex-col gap-[20px] pt-[100px]'>
            {/* Top Bar */}
            <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] fixed top-0 bg-black z-50'>
                <MdOutlineKeyboardBackspace 
                    onClick={() => navigate(`/profile/${userData.userName}`)}
                    className='text-white cursor-pointer w-[25px] h-[25px]' 
                />
                <h1 className='text-white text-[20px] font-semibold'>Edit Profile</h1>
            </div>

            {/* Profile Image & Text */}
            <div className='flex flex-col items-center gap-3'>
                <div 
                    onClick={() => imageInput.current.click()} 
                    className='w-[80px] h-[80px] md:w-[140px] md:h-[140px] border-2 border-black rounded-full cursor-pointer overflow-hidden'
                >
                    <input type="file" accept='image/*' ref={imageInput} hidden onChange={handleImage} />
                    <img src={frontendImage} alt="" className='w-full h-full object-cover' /> {/* ✅ h-full added */}
                </div>
                <div 
                    onClick={() => imageInput.current.click()} 
                    className='text-blue-500 text-center text-[16px] md:text-[18px] font-semibold'
                >
                    Change your profile picture
                </div>
            </div>

            {/* Inputs */}
            <input 
                type="text" 
                className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl text-white font-semibold px-[20px] outline-none' 
                onChange={(e) => setName(e.target.value)}
                value={name} 
                placeholder='Enter Your Name' 
            />

            <input 
                type="text" 
                className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl text-white font-semibold px-[20px] outline-none' 
                onChange={(e) => setuserName(e.target.value)}
                value={userName} 
                placeholder='Enter Your userName' 
            />

            <input 
                type="text" 
                className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl text-white font-semibold px-[20px] outline-none' 
                onChange={(e) => setBio(e.target.value)}
                value={bio} 
                placeholder='Enter Your Bio' 
            />

            <input 
                type="text" 
                className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl text-white font-semibold px-[20px] outline-none' 
                onChange={(e) => setProfession(e.target.value)}
                value={profession} 
                placeholder='Enter Your Profession' 
            />

            {/* Save Button */}
            <div className="w-[90%] max-w-[600px] px-[10px] py-[5px] bg-white cursor-pointer rounded-2xl">
                <button
                  type="button"
                  disabled={loading}
                  className={`w-full font-semibold py-3 rounded-md flex justify-center items-center gap-2 transition ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={handleEditProfile}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
            </div>
        </div>
    )
}

export default EditProfile
