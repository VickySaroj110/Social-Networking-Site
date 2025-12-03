import express from "express"
import { resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp, getMe } from "../controllers/auth.controller.js"

const authRouter =express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.get("/signout",signOut)
authRouter.post("/sendOtp",sendOtp)
authRouter.post("/verifyOtp",verifyOtp)
authRouter.post("/resetPassword",resetPassword)

// ⭐⭐⭐ Added missing route ⭐⭐⭐
authRouter.get("/me", getMe)

export default authRouter
