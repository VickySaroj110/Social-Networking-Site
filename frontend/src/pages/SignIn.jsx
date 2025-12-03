import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import gsap from 'gsap'


function SignIn() {
  const containerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { userName, password },
        { withCredentials: true }
      )
      dispatch(setUserData(result.data))
    } catch (error) {
      if (error.response) {
        console.log('Server said:', error.response.status, error.response.data)
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>

      <div
        ref={containerRef}
        className="w-full h-screen flex items-center justify-center bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e]"
      >
        <div className="w-[90%] lg:max-w-[60%] h-[600px] bg-white rounded-3xl flex justify-center items-center overflow-hidden shadow-xl border border-gray-700">
          <div className="w-full lg:w-[50%] h-full bg-white flex flex-col items-center justify-center px-8 gap-5">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h2>

            <div className="w-full">
              <label htmlFor="userName" className="text-sm text-gray-600">
                Username
              </label>
              <input
                type="text"
                id="userName"
                onChange={(e) => setUserName(e.target.value)}
                value={userName}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="w-full">
              <label htmlFor="password" className="text-sm text-gray-600">
                Password
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <p
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-purple-500 hover:underline cursor-pointer self-end"
            >
              Forgot Password?
            </p>

            <button
              type="button"
              disabled={loading}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md flex justify-center items-center gap-2 transition ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={handleSignIn}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/signup')}
                className="text-purple-600 hover:underline cursor-pointer"
              >
                Sign Up
              </span>
            </p>
          </div>

          <div className="md:w-[50%] h-full hidden lg:flex justify-center items-center bg-[#1e1e2f] flex-col gap-3 text-white text-lg font-semibold">
            <p className="text-center leading-relaxed px-4">
              “Connect, Share, and Stay <br/> Informed Safely” 🚀
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignIn
