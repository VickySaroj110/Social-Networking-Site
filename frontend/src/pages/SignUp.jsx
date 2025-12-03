import React, { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function Signup() {
  const [name, setName] = useState('')
  const [userName, setuserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSignUp = async () => {
    setErr('')
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name, userName, email, password },
        { withCredentials: true }
      )
      dispatch(setUserData(result.data))
    } catch (error) {
      if (error.response) {
        setErr(error.response?.data?.message || 'Something went wrong.')
      } else {
        console.error(error)
        setErr('Network error, please try again.')
      }
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-4xl h-[600px] bg-white flex rounded-3xl overflow-hidden shadow-lg border border-gray-800">
       
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 gap-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up to Psync</h2>

          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="userName" className="block mb-1 font-medium text-gray-700">
                Username
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setuserName(e.target.value)}
                className="w-full border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Create a password"
              />
            </div>
          </div>

          {err && <p className="text-red-600 text-sm font-semibold">{err}</p>}

          <button
            type="button"
            onClick={handleSignUp}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition"
          >
            Sign Up
          </button>

          <p className="text-center text-gray-700 text-sm">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/signin')}
              className="text-black font-semibold cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>

        <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-center items-center p-10 rounded-tr-3xl rounded-br-3xl">
          <p className="text-xl font-semibold max-w-sm text-center">
            “Connect, Share, and Stay Informed Safely”
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
