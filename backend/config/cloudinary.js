import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
const uploadOnCloudinary = async (file) => {
    
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const result = await cloudinary.uploader.upload(file, {
            resource_type: 'auto'
        })

        return result.secure_url
}

export default uploadOnCloudinary