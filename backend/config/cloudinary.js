import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const uploadOnCloudinary = async (file) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        console.log("📸 Uploading file to Cloudinary:", file);

        const result = await cloudinary.uploader.upload(file, {
            resource_type: 'auto'
        })

        console.log("✅ Cloudinary response:", result.secure_url);

        // Clean up local file after upload
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }

        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        }
    } catch (error) {
        console.error("❌ Cloudinary upload error:", error.message);
        throw error;
    }
}

export default uploadOnCloudinary