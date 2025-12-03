import multer from "multer"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname) // prevents duplicate names
  }
})

const upload = multer({ storage })  // ✅ this is the correct syntax
export { upload }
