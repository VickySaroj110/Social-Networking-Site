// import React, { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useParams } from 'react-router-dom'
// import { serverUrl } from '../App'
// import { setStoryData } from '../redux/storySlice'
// import StoryCard from '../component/StoryCard'

// function Story() {
//     const {userName} = useParams()
//     const {storyData} = useSelector(state=>state.story)
//     const dispatch = useDispatch()
//         const handleStory = async () => {
//             dispatch(setStoryData(null))
//         try {
//             const result = await axios.get(`${serverUrl}/api/story/getByUserName/${userName}`, { withCredentials: true })
//             console.log(result)
//             dispatch(setStoryData(result.data[0]))
//             useEffect(()=>{
//                 if(userName){
//                     handleStory()
//                 }
//             },[userName])
//         } catch (error) {
//             console.log(error)
//         }
//     }
//   return (
//     <div className='w-full h-[100vh] bg-black flex justify-center items-center'>
//       <StoryCard storyData={storyData}/>
//     </div>
//   )
// }

// export default Story

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import axios from 'axios'   // ⚠️ Missing import add karo
import { serverUrl } from '../App'
import { setStoryData } from '../redux/storySlice'
import StoryCard from '../component/StoryCard'

function Story() {
  const { userName } = useParams()
  const { storyData } = useSelector(state => state.story)
  const dispatch = useDispatch()

  const handleStory = async () => {
    dispatch(setStoryData(null))
    try {
      const result = await axios.get(`${serverUrl}/api/story/getByUserName/${userName}`, { withCredentials: true })
      console.log("Fetched Story Data:", result.data[0])
      dispatch(setStoryData(result.data[0]))   // ✅ Set correct story data
    } catch (error) {
      console.log(error)
    }
  }

  // ✅ useEffect correct jagah pe likho
  useEffect(() => {
    if (userName) {
      handleStory()
    }
  }, [userName])

  return (
    <div className='w-full h-[100vh] bg-black flex justify-center items-center'>
      <StoryCard storyData={storyData} />
    </div>
  )
}

export default Story
