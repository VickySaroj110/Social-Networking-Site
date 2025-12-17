import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { getAllMessage, getPrevUserChats, sendMessage, deleteMessage } from "../controllers/message.controller.js"

const messageRouter =express.Router()

messageRouter.post("/send/:receiverId",isAuth,upload.single("image"),sendMessage)
messageRouter.get("/getAll/:receiverId",isAuth,getAllMessage)
messageRouter.get("/prevChats",isAuth,getPrevUserChats)
messageRouter.delete("/delete/:messageId",isAuth,deleteMessage)

export default messageRouter