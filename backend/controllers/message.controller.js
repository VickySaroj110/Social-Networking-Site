import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Loop from "../models/loop.model.js";
import Notification from "../models/notification.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { message, loopId, postId } = req.body;

    console.log("📤 Sending message...");
    console.log("File received:", req.file ? `Yes - ${req.file.filename}` : "No");
    console.log("Message text:", message);
    console.log("PostId:", postId);
    console.log("LoopId:", loopId);

    // Upload image to cloudinary if provided
    let imageUrl = null;
    if (req.file) {
      console.log("📸 Uploading image to Cloudinary...");
      const cloudinaryResult = await uploadOnCloudinary(req.file.path);
      imageUrl = cloudinaryResult?.secure_url;
      console.log("✅ Image uploaded:", imageUrl);
    }

    // Create the message - message can be empty if image/post/loop is present
    const messageData = {
      sender: senderId,
      receiver: receiverId,
    };
    
    if (message && message.trim()) {
      messageData.message = message;
    }
    
    if (imageUrl) {
      messageData.image = imageUrl;
    }

    if (postId) {
      messageData.postId = postId;
    }

    if (loopId) {
      messageData.loopId = loopId;
    }

    const newMessage = await Message.create(messageData);

    console.log("✅ Message created:", newMessage._id);

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If none exists, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    // Populate postId and loopId with author and comments
    await newMessage.populate([
      {
        path: "loopId",
        populate: [
          { path: "author", select: "name userName profileImage" },
          { path: "comments.author", select: "name userName profileImage" }
        ]
      },
      {
        path: "postId",
        populate: [
          { path: "author", select: "name userName profileImage" },
          { path: "comments.author", select: "name userName profileImage" }
        ]
      }
    ]);

    // 🔔 Create message notification
    const notification = await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "message",
      message: `sent you a message`,
    });
    
    console.log("✅ Message notification created:", notification);

    return res.status(200).json(newMessage);
  } catch (error) {
    console.error("❌ sendMessage error:", error);
    return res.status(500).json({ message: `send Message error = ${error.message}` });
  }
};

export const getAllMessage = async (req, res) => {
    try {
        const senderId = req.userId
        const receiverId = req.params.receiverId
        
        let conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        }).populate({
            path: "messages",
            populate: [
                {
                    path: "loopId",
                    populate: [
                        { path: "author", select: "name userName profileImage" },
                        { path: "comments.author", select: "name userName profileImage" }
                    ]
                },
                {
                    path: "postId",
                    populate: [
                        { path: "author", select: "name userName profileImage" },
                        { path: "comments.author", select: "name userName profileImage" }
                    ]
                }
            ]
        })

        return res.status(200).json(conversation?.messages)

    }
    catch (error) {
        return res.status(500).json({ message: `get Message error= ${error}` })
    }
}


export const getPrevUserChats = async (req, res) => {
    try {
        const currentUserId = req.userId
        
        let conversation = await Conversation.find({
            participants: currentUserId
        }).populate("participants").sort({updatedAt: -1})

        const userMap={}
        conversation.forEach(conv =>{
            conv.participants.forEach(user =>{
                if(user._id != currentUserId){
                    userMap[user._id] = user
                }
            })
        })
        const previousUsers = Object.values(userMap)
        return res.status(200).json(previousUsers)

    }
    catch (error) {
        return res.status(500).json({ message: `get prev chat error= ${error}` })
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const messageId = req.params.messageId;

        // Find the message
        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if user is the SENDER only (not receiver)
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: "Only sender can delete this message" });
        }

        // Delete the message from the Message collection
        await Message.findByIdAndDelete(messageId);

        // Remove message from conversation - use correct query
        await Conversation.updateOne(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("❌ deleteMessage error:", error);
        return res.status(500).json({ message: `delete message error= ${error.message}` });
    }
}
