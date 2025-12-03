import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setProfileData } from '../redux/userSlice'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import FollowersFollowingModal from '../component/FollowersFollowingModal'
import dp1 from "../assets/dp1.jpeg"
import FollowButton from '../component/FollowButton'
import Post from '../component/Post'
import { FaPlus } from "react-icons/fa"
import { setSelectedUser } from "../redux/messageSlice"
import LoopCard from '../component/LoopCard'

function Profile() {
  const [activeTab, setActiveTab] = useState("posts")
  const [savedPosts, setSavedPosts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("followers")

  const navigate = useNavigate()
  const { userName } = useParams()
  const dispatch = useDispatch()
  const { profileData, userData } = useSelector(state => state.user)
  const { postData } = useSelector(state => state.post)
  const { loopData } = useSelector(state => state.loop)

  // Fetch profile data
  const handleProfile = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/getProfile/${userName}`, { withCredentials: true })
      dispatch(setProfileData(result.data))
    } catch (error) { console.log(error) }
  }

  // Fetch saved posts of current logged-in user only
  const fetchSavedPosts = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/post/savedPosts`, { withCredentials: true })
      // filter only posts saved by this profile user
      if(profileData?._id === userData._id){
        setSavedPosts(res.data)
      } else {
        setSavedPosts([]) // other users cannot see saved posts
      }
    } catch (error) { console.log(error) }
  }

  useEffect(() => {
    handleProfile()
    fetchSavedPosts()
  }, [userName, profileData?._id])

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setProfileData(null))
    } catch (error) { console.log(error) }
  }

  // ALL USER POSTS
  const userPosts = postData.filter(post => String(post.author?._id) === String(profileData?._id))

  // ALL USER REELS
  const userReels = loopData.filter(loop => String(loop.author?._id) === String(profileData?._id))

  // Refresh a single post in savedPosts after like/comment/delete
  const handleSavedPostUpdate = (updatedPost) => {
    setSavedPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p))
  }

  return (
    <div className='w-full h-screen overflow-y-auto bg-black'>

      {/* Top Bar */}
      <div className='w-full h-[80px] flex justify-between items-center px-[30px] text-white'>
        <div className='cursor-pointer' onClick={() => navigate("/")}>
          <MdOutlineKeyboardBackspace className='text-white w-[25px] h-[25px]' />
        </div>
        <div className='font-semibold text-[20px]'>{profileData?.userName}</div>
        <div className='font-semibold cursor-pointer text-[20px]' onClick={handleLogOut}>Log out</div>
      </div>

      {/* Profile Info */}
      <div className='w-full h-[150px] flex items-start gap-[20px] lg:gap-[50px] pt-[20px] px-[10px] justify-center'>
        <div className='w-[80px] h-[80px] md:w-[140px] md:h-[140px] border-2 border-black rounded-full overflow-hidden cursor-pointer'
             onClick={() => navigate("/editprofile")}>
          <img src={profileData?.profileImage || dp1} alt="" className='w-full h-full object-cover' />
        </div>

        <div>
          <div className='font-semibold text-[22px] text-white'>{profileData?.name}</div>
          <div className='text-[17px] text-[#ffffffe8]'>{profileData?.profession || "New User"}</div>
          <div className='text-[17px] text-[#ffffffe8]'>{profileData?.bio}</div>
        </div>
      </div>

      {/* STATS */}
      <div className='w-full h-[100px] flex items-center justify-center gap-[40px] md:gap-[60px] px-[20%] pt-[30px] text-white'>
        <div>
          <div className='text-white text-[22px] md:text-[30px] font-semibold'>
            {(profileData?.posts?.length || 0) + (profileData?.loops?.length || 0)}
          </div>
          <div className='text-[18px] md:text-[22px] text-[#ffffffc7]'>Posts</div>
        </div>

        <div onClick={() => { setModalType("following"); setShowModal(true) }} className='cursor-pointer'>
          <div className='text-white text-[22px] md:text-[30px] font-semibold'>{profileData?.following.length}</div>
          <div className='text-[18px] md:text-[22px] text-[#ffffffc7]'>Following</div>
        </div>

        <div onClick={() => { setModalType("followers"); setShowModal(true) }} className='cursor-pointer'>
          <div className='text-white text-[22px] md:text-[30px] font-semibold'>{profileData?.followers.length}</div>
          <div className='text-[18px] md:text-[22px] text-[#ffffffc7]'>Followers</div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className='w-full h-[80px] flex justify-center items-center gap-[20px]'>
        {profileData?._id === userData._id ? (
          <button
            className='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white cursor-pointer rounded-2xl'
            onClick={() => navigate("/editprofile")}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <FollowButton
              tailwind='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white cursor-pointer rounded-2xl'
              targetUserId={profileData?._id}
              onFollowChange={handleProfile}
            />
            <button
              className='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white cursor-pointer rounded-2xl'
              onClick={() => {
                dispatch(setSelectedUser(profileData));
                navigate("/messageArea");
              }}
            >
              Message
            </button>
          </>
        )}
      </div>

      {/* TABS */}
      <div className='flex justify-center gap-10 mt-6 text-white'>
        <button className={`font-semibold ${activeTab === "posts" ? "border-b-2 border-white pb-1" : ""}`} onClick={() => setActiveTab("posts")}>Posts</button>
        <button className={`font-semibold ${activeTab === "reels" ? "border-b-2 border-white pb-1" : ""}`} onClick={() => setActiveTab("reels")}>Reels</button>
        <button className={`font-semibold ${activeTab === "saved" ? "border-b-2 border-white pb-1" : ""}`} onClick={() => setActiveTab("saved")}>Saved</button>
      </div>

      {/* CONTENT BOX */}
      <div className='w-full min-h-[50vh] flex justify-center mt-4'>
        <div className={`w-full max-w-[900px] flex flex-col items-center rounded-t-[30px] relative gap-[20px] pt-[16px] pb-[40px] 
          ${activeTab === "reels" ? "bg-[#1a1a1a]" : "bg-white"}`}>

          {/* POSTS */}
          {activeTab === "posts" && userPosts.length === 0 && (
            <p className='text-gray-500 text-lg my-10'>No Posts Yet</p>
          )}
          {activeTab === "posts" && userPosts.map((post, index) => (
            <Post key={index} post={post} onUpdate={handleSavedPostUpdate} />
          ))}

          {/* UPLOAD BUTTON ONLY IN POSTS TAB */}
          {activeTab === "posts" && profileData?._id === userData._id && (
            <button
              onClick={() => navigate("/upload?tab=post")}
              className="w-[60px] h-[60px] rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-xl text-[28px] font-bold fixed bottom-10 right-10"
            >
              <FaPlus />
            </button>
          )}

          {/* REELS */}
          {activeTab === "reels" && userReels.length === 0 && (
            <p className='text-gray-400 text-lg my-10'>No Reels Yet</p>
          )}
          {activeTab === "reels" && userReels.map((loop, index) => (
            <div key={index} className="w-full flex justify-center items-center">
              <LoopCard loop={loop} onProfileClick={(u) => navigate(`/profile/${u}`)} />
            </div>
          ))}

          {/* SAVED POSTS */}
          {activeTab === "saved" && savedPosts.length === 0 && (
            <h2 className='text-gray-500 text-lg my-10'>No saved posts</h2>
          )}
          {activeTab === "saved" && savedPosts.map((post, index) => (
            <Post key={index} post={post} onUpdate={handleSavedPostUpdate} />
          ))}

        </div>
      </div>

      {/* FOLLOWERS/FOLLOWING MODAL */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-[300] flex justify-center items-center">
          <FollowersFollowingModal
            type={modalType}
            users={modalType === "followers" ? profileData?.followers : profileData?.following}
            onClose={() => {
              setShowModal(false)
              handleProfile()  // refresh followers/following count real-time
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Profile
