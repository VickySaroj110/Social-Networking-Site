import React, { useRef, useState, forwardRef, useEffect } from 'react'
import { FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { setGlobalMute } from '../redux/mediaSlice'

const SimpleVideoPlayer = forwardRef(function SimpleVideoPlayer({ media, src, showProgress = false, progress = 0, isStory = false }, ref) {
  const internalRef = useRef()
  const videoRef = ref || internalRef
  const [isPlaying, setIsPlaying] = useState(false)
  const videoSrc = src || media  // Support both 'src' and 'media' prop
  
  const dispatch = useDispatch()
  const { isMuted } = useSelector(state => state.media)

  // Auto-play/pause based on visibility (for posts)
  useEffect(() => {
    if (isStory) return // Stories handle their own auto-play
    
    let observer
    const handleIntersection = ([entry]) => {
      if (videoRef.current) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          // When video comes into view, unmute it
          videoRef.current.play().catch(() => {})
          setIsPlaying(true)
          dispatch(setGlobalMute(false)) // Unmute when in view
        } else {
          // When video leaves view, mute it
          videoRef.current.pause()
          setIsPlaying(false)
          dispatch(setGlobalMute(true)) // Mute when out of view
        }
      }
    }

    observer = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.5, 0.7, 1],
      rootMargin: '-10% 0px -10% 0px'
    })

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current)
    }
  }, [isStory])

  // Sync mute state from Redux
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    dispatch(setGlobalMute(!isMuted))
  }

  const handleVideoClick = () => {
    togglePlayPause()
  }

  return (
    <div 
      className='h-full w-full relative rounded-2xl overflow-hidden bg-black cursor-pointer'
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted={isMuted}
        playsInline
        className='h-full w-full object-cover'
      />

      {/* Progress Bar - Only for Stories */}
      {showProgress && (
        <div className='absolute top-0 w-full h-[3px] bg-gray-900 z-20'>
          <div
            className='h-full bg-white transition-all duration-50 ease-linear'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Mute/Unmute Button - Position based on context */}
      <button
        onClick={toggleMute}
        className={`absolute text-white p-2 rounded-lg transition-all z-50 ${
          isStory 
            ? 'top-4 right-12 bg-black/50 hover:bg-black/70' 
            : 'bottom-4 right-4 bg-black/50 hover:bg-black/70'
        }`}
      >
        {isMuted ? (
          <FiVolumeX className='w-5 h-5' />
        ) : (
          <FiVolume2 className='w-5 h-5' />
        )}
      </button>
    </div>
  )
})

export default SimpleVideoPlayer

