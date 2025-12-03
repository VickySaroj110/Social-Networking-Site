import React from 'react'
import LeftSide from '../component/LeftSide'
import Feed from '../component/Feed'
import RightSide from '../component/RightSide'

const Home = () => {
  return (
    <div className='w-full flex justify-center items-center'>
      <LeftSide/>
      <Feed/>
      <RightSide/>
    </div>
  )
}

export default Home
