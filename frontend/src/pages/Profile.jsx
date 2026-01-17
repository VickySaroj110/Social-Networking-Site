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
import { FaPlus, FaBookmark, FaRegBookmark, FaTrash } from "react-icons/fa"
import { setSelectedUser } from "../redux/messageSlice"
import LoopCard from '../component/LoopCard'

function Profile() {
  const [activeTab, setActiveTab] = useState("posts")
  const [savedPosts, setSavedPosts] = useState([])
  const [savedLoops, setSavedLoops] = useState([])
  const [savedTweets, setSavedTweets] = useState([])
  const [userTweets, setUserTweets] = useState([])
  const [userTweetSaveStatus, setUserTweetSaveStatus] = useState({})
  const [userReelsLoaded, setUserReelsLoaded] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("followers")
  const [showTweetComments, setShowTweetComments] = useState(null)
  const [tweetCommentText, setTweetCommentText] = useState("")

  const navigate = useNavigate()
  const { userName } = useParams()
  const dispatch = useDispatch()
  const { profileData, userData } = useSelector(state => state.user)
  const { postData } = useSelector(state => state.post)
  const { loopData } = useSelector(state => state.loop)

  // Fetch profile data
  const handleProfile = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/getProfile/${userName}`,
        { withCredentials: true }
      )
      dispatch(setProfileData(result.data))
    } catch (error) { console.log(error) }
  }

  // Fetch saved posts of current logged-in user only
  const fetchSavedPosts = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/post/savedPosts`,
        { withCredentials: true }
      )
      if (profileData?._id === userData._id) {
        setSavedPosts(res.data)
      } else {
        setSavedPosts([])
      }
    } catch (error) { console.log(error) }
  }

  // Fetch saved loops of current logged-in user only
  const fetchSavedLoops = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/loop/savedLoops`,
        { withCredentials: true }
      )
      if (profileData?._id === userData._id) {
        setSavedLoops(res.data)
      } else {
        setSavedLoops([])
      }
    } catch (error) { console.log(error) }
  }

  // Fetch saved tweets of current logged-in user only
  const fetchSavedTweets = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/tweet/savedTweets`,
        { withCredentials: true }
      )
      if (profileData?._id === userData._id) {
        setSavedTweets(res.data)
      } else {
        setSavedTweets([])
      }
    } catch (error) { console.log(error) }
  }

  // Fetch user's tweets
  const fetchUserTweets = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/tweet/userTweets/${profileData?._id}`,
        { withCredentials: true }
      )
      setUserTweets(res.data || [])
    } catch (error) {
      console.log("Error fetching user tweets:", error)
      setUserTweets([])
    }
  }

  // Fetch ALL user's reels (for profile page - no pagination)
  const fetchUserReels = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/loop/userLoops/${profileData?._id}`,
        { withCredentials: true }
      )
      console.log("User reels fetched:", res.data)
      setUserReelsLoaded(res.data)
    } catch (error) { 
      console.log("Error fetching user reels:", error)
      setUserReelsLoaded([])
    }
  }

  useEffect(() => {
    handleProfile()
    fetchSavedPosts()
    fetchSavedLoops()
    fetchSavedTweets()
  }, [userName, profileData?._id])

  // Fetch user reels whenever profileData changes
  useEffect(() => {
    if (profileData?._id) {
      fetchUserReels()
      fetchUserTweets()
    }
  }, [profileData?._id])

  // Update save status for user tweets based on savedTweets
  useEffect(() => {
    const saveStatusMap = {}
    userTweets.forEach(tweet => {
      saveStatusMap[tweet._id] = savedTweets.some(t => t._id === tweet._id)
    })
    setUserTweetSaveStatus(saveStatusMap)
  }, [userTweets, savedTweets])

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setProfileData(null))
    } catch (error) { console.log(error) }
  }

  // ALL USER POSTS
  const userPosts = postData.filter(
    post => String(post.author?._id) === String(profileData?._id)
  )

  // ALL USER REELS - use direct fetch instead of global state
  const userReels = userReelsLoaded

  // Refresh a single post in savedPosts after like/comment/delete or remove if unsaved
  const handleSavedPostUpdate = (updatedPost) => {
    if (updatedPost?.action === 'unsave') {
      // Post was unsaved, remove it immediately from savedPosts
      setSavedPosts(prev => prev.filter(p => p._id !== updatedPost._id))
    } else {
      // Post was updated, refresh it
      setSavedPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p))
    }
  }

  // Refresh a single loop in savedLoops after like/comment/delete or remove if unsaved
  const handleSavedLoopUpdate = (updatedLoop) => {
    if (updatedLoop?.action === 'unsave') {
      // Loop was unsaved, remove it immediately from savedLoops
      setSavedLoops(prev => prev.filter(l => l._id !== updatedLoop._id))
    } else {
      // Loop was updated, refresh it
      setSavedLoops(prev => prev.map(l => l._id === updatedLoop._id ? updatedLoop : l))
    }
  }

  // Update user reel after like/comment
  const handleUserReelUpdate = (updatedLoop) => {
    setUserReelsLoaded(prev => prev.map(l => l._id === updatedLoop._id ? updatedLoop : l))
  }

  // Refresh saved posts/loops when activeTab changes to saved
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedPosts()
      fetchSavedLoops()
    }
  }, [activeTab])

  // Auto-refresh saved loops when loopData changes
  useEffect(() => {
    if (activeTab === "saved" && loopData.length > 0) {
      fetchSavedLoops()
    }
  }, [loopData])

  // Handle tweet like
  const handleTweetLike = async (tweetId) => {
    try {
      await axios.post(
        `${serverUrl}/api/tweet/${tweetId}/like`,
        {},
        { withCredentials: true }
      )
      // Update the tweet in savedTweets
      setSavedTweets(prev => prev.map(t => 
        t._id === tweetId 
          ? {
              ...t,
              likes: t.likes?.includes(userData._id)
                ? t.likes.filter(id => id !== userData._id)
                : [...(t.likes || []), userData._id]
            }
          : t
      ))
    } catch (error) {
      console.log("like error", error)
    }
  }

  // Handle tweet delete
  const handleTweetDelete = async (tweetId) => {
    try {
      await axios.delete(`${serverUrl}/api/tweet/${tweetId}`, {
        withCredentials: true,
      })
      // Remove from savedTweets
      setSavedTweets(prev => prev.filter(t => t._id !== tweetId))
    } catch (error) {
      console.log("delete tweet error", error)
    }
  }

  // Handle tweet save/unsave
  const handleTweetSave = async (tweetId) => {
    try {
      await axios.delete(`${serverUrl}/api/tweet/${tweetId}/save`, {
        withCredentials: true,
      })
      // Remove from savedTweets
      setSavedTweets(prev => prev.filter(t => t._id !== tweetId))
    } catch (error) {
      console.log("unsave tweet error", error)
    }
  }

  // Handle add comment to tweet
  const handleAddTweetComment = async (tweetId) => {
    if (!tweetCommentText.trim()) return
    try {
      const res = await axios.post(
        `${serverUrl}/api/tweet/${tweetId}/comment`,
        { text: tweetCommentText },
        { withCredentials: true }
      )
      // Update the tweet in savedTweets
      setSavedTweets(prev => prev.map(t => 
        t._id === tweetId ? res.data : t
      ))
      setTweetCommentText("")
    } catch (error) {
      console.log("add comment error", error)
    }
  }

  // Handle delete comment from tweet
  const handleDeleteTweetComment = async (tweetId, commentId) => {
    try {
      const res = await axios.delete(
        `${serverUrl}/api/tweet/${tweetId}/comment/${commentId}`,
        { withCredentials: true }
      )
      // Update the tweet in savedTweets
      setSavedTweets(prev => prev.map(t => 
        t._id === tweetId ? res.data : t
      ))
    } catch (error) {
      console.log("delete comment error", error)
    }
  }

  // Handlers for User Tweets Tab
  const handleUserTweetLike = async (tweetId) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/tweet/${tweetId}/like`,
        {},
        { withCredentials: true }
      )
      const updated = res.data?.tweet || res.data
      setUserTweets(prev => prev.map(t => t._id === updated._id ? updated : t))
    } catch (error) {
      console.log("like error", error)
    }
  }

  const handleUserTweetDelete = async (tweetId) => {
    try {
      await axios.delete(`${serverUrl}/api/tweet/${tweetId}`, {
        withCredentials: true,
      })
      setUserTweets(prev => prev.filter(t => t._id !== tweetId))
    } catch (error) {
      console.log("delete tweet error", error)
    }
  }

  const handleUserTweetSave = async (tweetId) => {
    try {
      const isSaved = userTweetSaveStatus[tweetId]
      
      if (isSaved) {
        // Unsave
        await axios.delete(`${serverUrl}/api/tweet/${tweetId}/save`, {
          withCredentials: true,
        })
        setUserTweetSaveStatus(prev => ({...prev, [tweetId]: false}))
      } else {
        // Save
        await axios.post(
          `${serverUrl}/api/tweet/${tweetId}/save`,
          {},
          { withCredentials: true }
        )
        setUserTweetSaveStatus(prev => ({...prev, [tweetId]: true}))
      }
    } catch (error) {
      console.log("save tweet error", error)
    }
  }

  const handleAddUserTweetComment = async (tweetId) => {
    if (!tweetCommentText.trim()) return
    try {
      const res = await axios.post(
        `${serverUrl}/api/tweet/${tweetId}/comment`,
        { text: tweetCommentText },
        { withCredentials: true }
      )
      setUserTweets(prev => prev.map(t => 
        t._id === tweetId ? res.data : t
      ))
      setTweetCommentText("")
    } catch (error) {
      console.log("add comment error", error)
    }
  }

  const handleDeleteUserTweetComment = async (tweetId, commentId) => {
    try {
      const res = await axios.delete(
        `${serverUrl}/api/tweet/${tweetId}/comment/${commentId}`,
        { withCredentials: true }
      )
      setUserTweets(prev => prev.map(t => 
        t._id === tweetId ? res.data : t
      ))
    } catch (error) {
      console.log("delete comment error", error)
    }
  }

  return (
    <div className='w-full h-screen overflow-y-auto bg-black'>

      {/* Top Bar */}
      <div className='w-full h-[80px] flex justify-between items-center px-[30px] text-white'>
        <div className='cursor-pointer' onClick={() => navigate("/")}>
          <MdOutlineKeyboardBackspace className='text-white w-[25px] h-[25px]' />
        </div>
        <div className='font-semibold text-[20px]'>{profileData?.userName}</div>
        <div
          className='font-semibold cursor-pointer text-[20px]'
          onClick={handleLogOut}
        >
          Log out
        </div>
      </div>

      {/* Profile Info */}
      <div className='w-full h-[150px] flex items-start gap-[20px] lg:gap-[50px] pt-[20px] px-[10px] justify-center'>
        <div
          className={`w-[80px] h-[80px] md:w-[140px] md:h-[140px] border-2 border-black rounded-full overflow-hidden 
          ${profileData?._id === userData._id ? "cursor-pointer" : "cursor-default"}`}
          onClick={() => {
            if (profileData?._id === userData._id) {
              navigate("/editprofile")
            }
          }}
        >
          <img
            src={profileData?.profileImage || dp1}
            alt=""
            className='w-full h-full object-cover'
          />
        </div>

        <div>
          <div className='font-semibold text-[22px] text-white'>{profileData?.name}</div>
          <div className='text-[17px] text-[#ffffffe8]'>
            {profileData?.profession}
          </div>
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

        <div
          onClick={() => { setModalType("following"); setShowModal(true) }}
          className='cursor-pointer'
        >
          <div className='text-white text-[22px] md:text-[30px] font-semibold'>
            {profileData?.following.length}
          </div>
          <div className='text-[18px] md:text-[22px] text-[#ffffffc7]'>Following</div>
        </div>

        <div
          onClick={() => { setModalType("followers"); setShowModal(true) }}
          className='cursor-pointer'
        >
          <div className='text-white text-[22px] md:text-[30px] font-semibold'>
            {profileData?.followers.length}
          </div>
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
        <button
          className={`font-semibold ${activeTab === "posts" ? "border-b-2 border-white pb-1" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`font-semibold ${activeTab === "reels" ? "border-b-2 border-white pb-1" : ""}`}
          onClick={() => setActiveTab("reels")}
        >
          Reels
        </button>
        <button
          className={`font-semibold ${activeTab === "tweets" ? "border-b-2 border-white pb-1" : ""}`}
          onClick={() => setActiveTab("tweets")}
        >
          Tweets
        </button>
        <button
          className={`font-semibold ${activeTab === "saved" ? "border-b-2 border-white pb-1" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          Saved
        </button>
      </div>

      {/* CONTENT BOX */}
      <div className='w-full min-h-[50vh] flex justify-center mt-4'>
        <div
          className={`w-full max-w-[900px] flex flex-col items-center rounded-t-[30px] relative gap-[20px] pt-[16px] pb-[40px] bg-[#1a1a1a]`}
        >

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
              <LoopCard
                loop={loop}
                onProfileClick={(u) => navigate(`/profile/${u}`)}
                onLoopUpdate={handleUserReelUpdate}
              />
            </div>
          ))}

          {/* TWEETS */}
          {activeTab === "tweets" && userTweets.length === 0 && (
            <p className='text-gray-400 text-lg my-10'>No Tweets Yet</p>
          )}
          {activeTab === "tweets" && userTweets.map((tweet) => (
            <div key={tweet._id} className='w-full flex justify-center'>
              <div className='w-full max-w-[600px] bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4'>
                <div className='flex gap-3'>
                  <img
                    src={tweet.author?.profileImage || dp1}
                    alt="profile"
                    className='w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer'
                    onClick={() => navigate(`/profile/${tweet.author?.userName}`)}
                  />
                  <div className='flex-1'>
                    <div className='flex justify-between items-start gap-4'>
                      <div className='flex gap-2 items-center'>
                        <span
                          className='font-bold hover:underline cursor-pointer text-white'
                          onClick={() => navigate(`/profile/${tweet.author?.userName}`)}
                        >
                          {tweet.author?.name || "User"}
                        </span>
                        <span className='text-gray-500'>@{tweet.author?.userName}</span>
                        <span className='text-gray-500'>·</span>
                        <span className='text-gray-500 text-sm'>
                          {new Date(tweet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {tweet.verdict && (
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs whitespace-nowrap ${
                            tweet.verdict === "TRUE"
                              ? "bg-green-100 text-green-700"
                              : tweet.verdict === "FALSE"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tweet.verdict}
                        </span>
                      )}
                    </div>
                    <div className='mt-2 text-white text-base whitespace-pre-wrap'>{tweet.text}</div>
                    {tweet.image && (
                      <img
                        src={tweet.image}
                        alt="tweet"
                        className='mt-3 w-full max-h-[300px] object-cover rounded-2xl'
                      />
                    )}
                    {/* Actions */}
                    <div className='mt-3 flex justify-start text-gray-500 gap-8 text-sm'>
                      <button
                        onClick={() => setShowTweetComments(showTweetComments === tweet._id ? null : tweet._id)}
                        className='group flex items-center gap-2 hover:text-blue-500 transition'
                      >
                        <span>💬</span>
                        <span>{tweet.comments?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleUserTweetLike(tweet._id)}
                        className='group flex items-center gap-2 hover:text-red-500 transition'
                      >
                        <span>❤️</span>
                        <span>{tweet.likes?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleUserTweetSave(tweet._id)}
                        className='group flex items-center gap-2 hover:text-yellow-500 transition'
                        title={userTweetSaveStatus[tweet._id] ? "Remove from saved" : "Save tweet"}
                      >
                        {userTweetSaveStatus[tweet._id] ? (
                          <FaBookmark className='w-4 h-4 text-yellow-500' />
                        ) : (
                          <FaRegBookmark className='w-4 h-4 text-gray-500' />
                        )}
                      </button>

                      {userData._id === tweet.author._id && (
                        <button
                          onClick={() => handleUserTweetDelete(tweet._id)}
                          className='text-gray-400 hover:text-red-500 transition'
                          title="Delete tweet"
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {showTweetComments === tweet._id && (
                <div className='w-full max-w-[600px] bg-[#1a1a1a] border border-gray-700 border-t-0 rounded-b-2xl p-4 flex flex-col gap-4'>
                  {/* Add Comment */}
                  <div className='flex gap-3 pb-4 border-b border-gray-700'>
                    <img
                      src={userData?.profileImage || dp1}
                      alt="profile"
                      className='w-10 h-10 rounded-full object-cover flex-shrink-0'
                    />
                    <div className='flex-1'>
                      <textarea
                        value={tweetCommentText}
                        onChange={(e) => setTweetCommentText(e.target.value)}
                        maxLength={280}
                        rows={2}
                        className='w-full bg-gray-800 border border-gray-700 rounded-lg p-2 outline-none resize-none placeholder-gray-500 text-white text-sm'
                        placeholder='Reply to this tweet...'
                      />
                      <button
                        onClick={() => handleAddUserTweetComment(tweet._id)}
                        className='mt-2 px-4 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600'
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className='flex-1 max-h-[400px] overflow-y-auto flex flex-col gap-3'>
                    {tweet.comments?.map((comment) => (
                      <div key={comment._id} className='flex gap-2'>
                        <img
                          src={comment.author?.profileImage || dp1}
                          alt="profile"
                          className='w-8 h-8 rounded-full object-cover flex-shrink-0'
                        />
                        <div className='flex-1'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <span className='font-bold text-white text-sm'>{comment.author?.name}</span>
                              <span className='text-gray-500 text-sm ml-1'>@{comment.author?.userName}</span>
                            </div>
                            {userData._id === comment.author._id && (
                              <button
                                onClick={() => handleDeleteUserTweetComment(tweet._id, comment._id)}
                                className='text-gray-400 hover:text-red-500'
                              >
                                <FaTrash className='w-3 h-3' />
                              </button>
                            )}
                          </div>
                          <p className='text-white text-sm mt-1'>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* SAVED POSTS AND REELS */}
          {activeTab === "saved" && savedPosts.length === 0 && savedLoops.length === 0 && savedTweets.length === 0 && (
            <h2 className='text-gray-500 text-lg my-10'>No saved posts, reels or tweets</h2>
          )}
          
          {/* Display Saved Posts */}
          {activeTab === "saved" && savedPosts.map((post) => (
            <Post key={post._id} post={post} onUpdate={handleSavedPostUpdate} isSavedProp={true} />
          ))}

          {/* Display Saved Loops/Reels */}
          {activeTab === "saved" && savedLoops.map((loop) => (
            <div key={loop._id} className="w-full flex justify-center items-center">
              <LoopCard
                loop={loop}
                onProfileClick={(u) => navigate(`/profile/${u}`)}
                onLoopSaved={handleSavedLoopUpdate}
                isSavedProp={true}
              />
            </div>
          ))}

          {/* Display Saved Tweets */}
          {activeTab === "saved" && savedTweets.map((tweet) => (
            <div key={tweet._id}>
              <div className='w-full max-w-[600px] bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4'>
                <div className='flex gap-3'>
                  <img
                    src={tweet.author?.profileImage || dp1}
                    alt="profile"
                    className='w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer'
                    onClick={() => navigate(`/profile/${tweet.author?.userName}`)}
                  />
                  <div className='flex-1'>
                    <div className='flex justify-between items-start gap-4'>
                      <div className='flex gap-2 items-center'>
                        <span
                          className='font-bold hover:underline cursor-pointer text-white'
                          onClick={() => navigate(`/profile/${tweet.author?.userName}`)}
                        >
                          {tweet.author?.name || "User"}
                        </span>
                        <span className='text-gray-500'>@{tweet.author?.userName}</span>
                        <span className='text-gray-500'>·</span>
                        <span className='text-gray-500 text-sm'>
                          {new Date(tweet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {tweet.verdict && (
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs whitespace-nowrap ${
                            tweet.verdict === "TRUE"
                              ? "bg-green-100 text-green-700"
                              : tweet.verdict === "FALSE"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tweet.verdict}
                        </span>
                      )}
                    </div>
                    <div className='mt-2 text-white text-base whitespace-pre-wrap'>{tweet.text}</div>
                    {tweet.image && (
                      <img
                        src={tweet.image}
                        alt="tweet"
                        className='mt-3 w-full max-h-[300px] object-cover rounded-2xl'
                      />
                    )}
                    {/* Actions */}
                    <div className='mt-3 flex justify-start text-gray-500 gap-8 text-sm'>
                      <button
                        onClick={() => setShowTweetComments(showTweetComments === tweet._id ? null : tweet._id)}
                        className='group flex items-center gap-2 hover:text-blue-500 transition'
                      >
                        <span>💬</span>
                        <span>{tweet.comments?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleTweetLike(tweet._id)}
                        className='group flex items-center gap-2 hover:text-red-500 transition'
                      >
                        <span>❤️</span>
                        <span>{tweet.likes?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleTweetSave(tweet._id)}
                        className='group flex items-center gap-2 hover:text-yellow-500 transition'
                        title="Remove from saved"
                      >
                        <FaBookmark className='w-4 h-4 text-yellow-500' />
                      </button>

                      {userData._id === tweet.author._id && (
                        <button
                          onClick={() => handleTweetDelete(tweet._id)}
                          className='text-gray-400 hover:text-red-500 transition'
                          title="Delete tweet"
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {showTweetComments === tweet._id && (
                <div className='w-full max-w-[600px] bg-[#1a1a1a] border border-gray-700 border-t-0 rounded-b-2xl p-4'>
                  {/* Add Comment */}
                  <div className='flex gap-3 pb-4 border-b border-gray-700'>
                    <img
                      src={userData?.profileImage || dp1}
                      alt="profile"
                      className='w-10 h-10 rounded-full object-cover flex-shrink-0'
                    />
                    <div className='flex-1'>
                      <textarea
                        value={tweetCommentText}
                        onChange={(e) => setTweetCommentText(e.target.value)}
                        maxLength={280}
                        rows={2}
                        className='w-full bg-gray-800 border border-gray-700 rounded-lg p-2 outline-none resize-none placeholder-gray-500 text-white text-sm'
                        placeholder='Reply to this tweet...'
                      />
                      <button
                        disabled={!tweetCommentText.trim()}
                        onClick={() => handleAddTweetComment(tweet._id)}
                        className={`mt-2 px-4 py-1 rounded-full font-bold text-sm transition ${
                          !tweetCommentText.trim()
                            ? "bg-blue-300 text-white cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Display Comments */}
                  <div className='mt-4 max-h-[300px] overflow-auto'>
                    {(!tweet.comments || tweet.comments.length === 0) ? (
                      <div className='text-center text-gray-500 py-4'>No comments yet</div>
                    ) : (
                      tweet.comments.map((comment) => (
                        <div key={comment._id} className='py-3 border-b border-gray-700 last:border-b-0'>
                          <div className='flex gap-2'>
                            <img
                              src={comment.author?.profileImage || dp1}
                              alt="profile"
                              className='w-8 h-8 rounded-full object-cover cursor-pointer'
                              onClick={() => navigate(`/profile/${comment.author?.userName}`)}
                            />
                            <div className='flex-1'>
                              <div className='flex gap-1 items-center'>
                                <span
                                  className='font-bold text-white cursor-pointer hover:underline'
                                  onClick={() => navigate(`/profile/${comment.author?.userName}`)}
                                >
                                  {comment.author?.name || "User"}
                                </span>
                                <span className='text-gray-500 text-sm'>@{comment.author?.userName}</span>
                              </div>
                              <p className='text-white text-sm mt-1'>{comment.text}</p>
                              {userData._id === comment.author?._id && (
                                <button
                                  onClick={() => handleDeleteTweetComment(tweet._id, comment._id)}
                                  className='text-red-500 text-xs mt-1 hover:text-red-400'
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
              handleProfile()
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Profile
