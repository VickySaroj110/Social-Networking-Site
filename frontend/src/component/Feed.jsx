import React, { useEffect, useRef, useState, useMemo } from 'react'
import { FaRegHeart } from "react-icons/fa6";
import { MdRefresh } from "react-icons/md";
import psync from "../assets/psync.png"
import StoryDp from './StoryDp';
import Nav from './Nav';
import Post from './Post';
import LoopCard from './LoopCard'
import { useSelector, useDispatch } from 'react-redux';
import { BiMessageAltDetail } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import { appendLoopData, setLoopData } from '../redux/loopSlice';
import { appendPostData, setPostData, clearPostData } from '../redux/postSlice';
import { clearLoopData } from '../redux/loopSlice';
import axios from 'axios';
import { serverUrl } from '../App';

function Feed() {
  const { postData, currentPage: postPage, hasMore: postsHasMore } = useSelector(state => state.post)
  const { loopData, currentPage: loopPage, hasMore: loopsHasMore } = useSelector(state => state.loop)
  const { userData } = useSelector(state => state.user)
  const { storyList, currentUserStory } = useSelector(state => state.story)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [displayPage, setDisplayPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const reelsContainerRef = useRef(null);

  // Shuffle data on initial page load
  useEffect(() => {
    if (isInitialLoad && postData?.length > 0 && loopData?.length > 0) {
      // Shuffle posts
      const shuffledPosts = [...postData].sort(() => Math.random() - 0.5);
      // Shuffle reels
      const shuffledLoops = [...loopData].sort(() => Math.random() - 0.5);
      
      dispatch(setPostData({ posts: shuffledPosts, totalPosts: postData.length, totalPages: 1, currentPage: 1, hasMore: false }));
      dispatch(setLoopData({ loops: shuffledLoops, totalLoops: loopData.length, totalPages: 1, currentPage: 1, hasMore: false }));
      
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  // Combine and mix posts and reels
  const mixedFeed = useMemo(() => {
    const combined = [];
    const maxLength = Math.max(postData?.length || 0, loopData?.length || 0);
    
    // Alternate between posts and reels
    for (let i = 0; i < maxLength; i++) {
      if (i < (postData?.length || 0)) {
        combined.push({ type: 'post', data: postData[i], id: `post-${postData[i]._id}` });
      }
      if (i < (loopData?.length || 0)) {
        combined.push({ type: 'reel', data: loopData[i], id: `reel-${loopData[i]._id}` });
      }
    }
    
    return combined;
  }, [postData, loopData]);

  // Paginate the mixed feed (show all items)
  const itemsPerPage = 1000; // Large number to show all
  const displayedFeed = useMemo(() => {
    return mixedFeed.slice(0, displayPage * itemsPerPage);
  }, [mixedFeed, displayPage]);

  // Mute videos on mount
  useEffect(() => {
    const container = reelsContainerRef.current;
    if (!container) return;

    const videos = container.querySelectorAll('video');
    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
    });
  }, []);

  // Load more when scrolling
  useEffect(() => {
    const container = reelsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // If user is 500px from bottom, load more (more aggressive)
      const scrollThreshold = 500;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold;
      
      if (isNearBottom) {
        if (displayPage * itemsPerPage < mixedFeed.length) {
          // Just show more items from existing data
          setDisplayPage(prev => prev + 1);
        } else if ((postsHasMore || loopsHasMore) && !loading) {
          // Load more data from API
          console.log("Loading more content...");
          loadMore();
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [displayPage, mixedFeed.length, postsHasMore, loopsHasMore, loading]);

  const loadMore = async () => {
    setLoading(true);
    try {
      // Load next page of posts if available
      if (postsHasMore) {
        const nextPostPage = postPage + 1;
        const postsResult = await axios.get(
          `${serverUrl}/api/post/getAll?page=${nextPostPage}&limit=10`,
          { withCredentials: true }
        );
        dispatch(appendPostData(postsResult.data));
      }

      // Load next page of reels if available
      if (loopsHasMore) {
        const nextLoopPage = loopPage + 1;
        const loopsResult = await axios.get(
          `${serverUrl}/api/loop/getAll?page=${nextLoopPage}&limit=10`,
          { withCredentials: true }
        );
        dispatch(appendLoopData(loopsResult.data));
      }

      setDisplayPage(prev => prev + 1);
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshFeed = async () => {
    setLoading(true);
    setDisplayPage(1);
    
    try {
      // Clear existing data and reload fresh
      dispatch(clearPostData());
      dispatch(clearLoopData());
      
      // Fetch fresh data with large limit (all content)
      const postsResult = await axios.get(
        `${serverUrl}/api/post/getAll?page=1&limit=500`,
        { withCredentials: true }
      );
      const loopsResult = await axios.get(
        `${serverUrl}/api/loop/getAll?page=1&limit=500`,
        { withCredentials: true }
      );
      
      // Shuffle the posts array
      const shuffledPosts = postsResult.data.posts ? [...postsResult.data.posts].sort(() => Math.random() - 0.5) : postsResult.data;
      
      // Shuffle the loops array
      const shuffledLoops = loopsResult.data.loops ? [...loopsResult.data.loops].sort(() => Math.random() - 0.5) : loopsResult.data;
      
      // Set shuffled data
      dispatch(setPostData({ ...postsResult.data, posts: shuffledPosts }));
      dispatch(setLoopData({ ...loopsResult.data, loops: shuffledLoops }));
      
      // Scroll to top
      if (reelsContainerRef.current) {
        reelsContainerRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Error refreshing feed:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <StoryDp userName={'Your Story'} profileImage={userData?.profileImage} story={currentUserStory} />
        {storyList?.map((story, index) => (
          <StoryDp
            userName={story.author.userName}
            profileImage={story.author.profileImage}
            story={story}
            key={index}
          />
        ))}
      </div>

      {/* Mixed Feed */}
      <div
        className='w-full min-h-[100vh] flex flex-col items-center gap-[20px] p-[10px] pt-[40px] bg-[#1a1a1a] rounded-t-[60px] relative pb-[120px]'
        ref={reelsContainerRef}
      >
        {/* Nav with Refresh Button */}
        <div className='flex items-center justify-between w-full px-[10px]'>
          <Nav />
          <button 
            onClick={refreshFeed}
            disabled={loading}
            className='ml-4 p-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50'
            title='Refresh feed'
          >
            <MdRefresh className={`text-white w-[24px] h-[24px] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Display mixed posts and reels */}
        {displayedFeed.length > 0 ? (
          displayedFeed.map((item) => (
            item.type === 'post' ? (
              <Post post={item.data} key={item.id} />
            ) : (
              <div key={item.id} className="w-full flex justify-center">
                <div className="w-full max-w-[480px] border-t-2 border-b-2 border-black rounded-2xl overflow-hidden">
                  <LoopCard loop={item.data} onProfileClick={handleProfileClick} />
                </div>
              </div>
            )
          ))
        ) : (
          <div className='text-center text-gray-400 mt-[50px]'>
            <p className='text-lg'>No posts or reels yet</p>
            <p className='text-sm'>Follow more users to see their content</p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className='text-center text-gray-400 py-4'>
            <div className='animate-spin w-8 h-8 border-2 border-gray-600 border-t-white rounded-full mx-auto'></div>
            <p className='mt-2 text-sm'>Loading content...</p>
          </div>
        )}

        {/* Load More Button - Fallback if infinite scroll doesn't work */}
        {!loading && (postsHasMore || loopsHasMore) && displayPage * itemsPerPage >= mixedFeed.length && (
          <button
            onClick={() => loadMore()}
            className='px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition mt-8 mb-8'
          >
            Load More
          </button>
        )}

      </div>
    </div>
  )
}

export default Feed
