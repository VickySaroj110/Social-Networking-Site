import mongoose from "mongoose";

const connentDB = async (req,res) => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connected")
    }

    catch(error){
        console.log("failed")
    }
}

export default connentDB