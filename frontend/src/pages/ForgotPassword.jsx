import React, { useState } from 'react'
import { serverUrl } from '../App'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setnewPassword] = useState("")
  const [confirmPassword, setconfirmPassword] = useState("")
  const [inputClicked, setinputClicked] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false
  })
  const navigate = useNavigate();
  const handleStep1=async () => {
    try {
      const result= await axios.post(`${serverUrl}/api/auth/sendOtp`,{email},{ withCredentials: true })
      console.log(result.data)
      setStep(2)
    } catch (error) {
      console.log(error)
    }
  }

    const handleStep2=async () => {
    try {
      const result= await axios.post(`${serverUrl}/api/auth/verifyOtp`,{email,otp},{ withCredentials: true })
      console.log(result.data)
      setStep(3)
    } catch (error) {
      console.log(error)
    }
  }

    const handleStep3=async () => {
    try {
      if(newPassword !== confirmPassword){
        return console.log("password does not match")
      }
      const result= await axios.post(`${serverUrl}/api/auth/resetPassword`,{email,password:newPassword},{withCredentials:true})
      console.log(result.data)
      navigate('/signin');
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='w-full h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center'>
      {step == 1 && <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center
       items-center flex-col border-[#1a1f23]'>
        <h2>Reset Password</h2>
        <div>
          <label htmlFor="email">Enter your email:</label>
          <input type="email" id='email' onChange={(e) => setEmail(e.target.value)} value={email} className='border-2 border-black' />
        </div>
        <button type="button" className='text-white bg-black p-[7px] w-[70%] rounded-2xl' onClick={handleStep1}>Send OTP</button>
      </div>}


      {step == 2 && <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center
       items-center flex-col border-[#1a1f23]'>
        <div onClick={() => setinputClicked({ ...inputClicked, otp: true })}>
          <label htmlFor="otp">Enter OTP:</label>
          <input type="text" id='otp' onChange={(e) => setOtp(e.target.value)} value={otp} className='border-2 border-black' />
        </div>
        <button type="button" className='text-white bg-black p-[7px] w-[70%] rounded-2xl' onClick={handleStep2}>Submit</button>
      </div>}

      {step == 3 && <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center
       items-center flex-col border-[#1a1f23]'>
        <div onClick={() => setinputClicked({ ...inputClicked, newPassword: true })}>
          <label htmlFor="password">Enter Password:</label>
          <input type="password" id='newPassword' onChange={(e) => setnewPassword(e.target.value)} value={newPassword} className='border-2 border-black' />
        </div>

        <div onClick={() => setinputClicked({ ...inputClicked, confirmPassword: true })}>
          <label htmlFor="confirm-password">Enter Confirm Password:</label>
          <input type="password" id='confirmPassword' onChange={(e) => setconfirmPassword(e.target.value)} value={confirmPassword} className='border-2 border-black' />
        </div>
        <button type="button" className='text-white bg-black p-[7px] w-[70%] rounded-2xl' onClick={handleStep3}>Submit</button>
      </div>}

    </div>
  )
}

export default ForgotPassword
