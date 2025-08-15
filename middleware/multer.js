import multer from "multer";
// import path from 'path'

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + path.extname(file.originalname)
//       cb(null, file.fieldname + '_' + uniqueSuffix)
//     }
//   })

const storage = multer.memoryStorage(); // Store files in memory

  export const upload = multer({ 
    storage: storage,
     limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 12 // Maximum of 12 files
  }
   })