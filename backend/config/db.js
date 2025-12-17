import mongoose from "mongoose";

const connentDB = async (req,res) => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connected")
    }

    catch(error){
        console.log("error while connecting to DB", error)
    }
}

export default connentDB