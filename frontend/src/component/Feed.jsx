import React, { useEffect, useRef } from 'react'
import { FaRegHeart } from "react-icons/fa6";
import psync from "../assets/psync.png"
import StoryDp from './StoryDp';
import Nav from './Nav';
import Post from './Post';
import LoopCard from './LoopCard'
import { useSelector } from 'react-redux';
import { BiMessageAltDetail } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';

function Feed() {
  const { postData } = useSelector(state => state.post)
  const { loopData } = useSelector(state => state.loop)
  const { userData } = useSelector(state => state.user)
  const { storyList, currentUserStory } = useSelector(state => state.story)
  const navigate = useNavigate()

  const reelsContainerRef = useRef(null);

  // ✅ FIXED: Only mute videos ONCE on initial mount (not on every loopData update)
  useEffect(() => {
    const container = reelsContainerRef.current;
    if (!container) return;

    const videos = container.querySelectorAll('video');
    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
    });
  }, []); // ✅ EMPTY DEPENDENCY - runs only once on mount!

  const handleProfileClick = (userName) => {
    navigate(`/profile/${userName}`)
  }

  return (
    <div className='lg:w-[50%] w-full bg-[#121212] min-h-[100vh] lg:h-[100vh] relative lg:overflow-y-auto'>

      {/* Top Nav */}
      <div className='w-full h-[100px] flex items-center justify-between p-[20px] lg:hidden'>
        <img src={psync} alt="" className='w-[40px]' />
        <div className='flex items-center gap-[10px]'>
          <FaRegHeart className='text-white w-[25px] h-[25px]' />
          <BiMessageAltDetail
            className='text-white w-[25px] h-[25px]'
            onClick={() => navigate("/messages")}
          />
        </div>
      </div>

      {/* Stories */}
      <div className='flex w-full overflow-auto gap-[10px] items-center p-[20px]'>
        <StoryDp userName={'Your Story'} profileImage={userData.profileImage} story={currentUserStory} />
        {storyList?.map((story, index) => (
          <StoryDp
            userName={story.author.userName}
            profileImage={story.author.profileImage}
            story={story}
            key={index}
          />
        ))}
      </div>

      {/* Posts and Reels */}
      <div
        className='w-full min-h-[100vh] flex flex-col items-center gap-[20px] p-[10px] pt-[40px] bg-[#1a1a1a] rounded-t-[60px] relative pb-[120px]'
        ref={reelsContainerRef}
      >
        <Nav />

        {/* Posts */}
        {postData?.map((post, index) => (
          <Post post={post} key={index} />
        ))}

        {/* Reels */}
        {loopData?.map((loop, index) => (
          <div key={index} className="w-full flex justify-center">
            <div className="w-full max-w-[480px] border-t-2 border-b-2 border-black rounded-2xl overflow-hidden">
              <LoopCard loop={loop} onProfileClick={handleProfileClick} />
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

export default Feed
