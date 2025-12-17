import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    loopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loop",
        default: null
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    message:{
        type:String
    },
    image:{
        type:String
    }
}, { timestamps: true })

const Message = mongoose.model("Message",messageSchema)
export default Message