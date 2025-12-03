import jwt from  "jsonwebtoken"

const genToken =async (userId) => {
    try{
        const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"10y"})
        return token
    }
    catch(error)
    {
        return resizeBy.status(500).json(`gen token error  ${error}`)
    }
}

export default genToken