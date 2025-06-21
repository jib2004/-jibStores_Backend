import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
import * as url from 'url';
import authRouter from './routes/users/auth.js'
import connectDb from './middleware/connectDb.js'
import { sellerRoute } from './routes/users/seller.js'
import { buyerRoute } from './routes/users/buyer.js'
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';


export const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
}
);

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true

}))
app.use(cookieParser())
dotenv.config()
connectDb(process.env.MONGODB_URI)


app.use(express.static('uploads'))// allows you access this file

app.get('/',(req,res)=>{
    res.send('Hello World')
})

io.on('connection', (socket) => {
   console.log("Client connected:", socket.id);

   socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
});

});

// app.post('/upload',upload.single('profile'),(req,res)=>{
//     res.send('Upload Successfully')
//     res.json(req.file.filename)
// })


app.get('/getImage', (req, res) => {
   
  });

  app.use("/auth",authRouter)
  app.use("/seller",sellerRoute)
  app.use("/buyer",buyerRoute)

app.listen(process.env.PORT,()=>{
    console.log('server is running on port 5000')
})





// File download endpoint
// app.get('/download/:filename', (req, res) => {
//     const fileName = req.params.filename;
//     const filePath = path.join(__dirname, 'uploads', fileName);
  
//     try {
//       if (fs.existsSync(filePath)) {
//         res.sendFile(filePath);
//       } else {
//         res.status(404).send('File not found.');
//       }
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       res.status(500).send('Internal server error.');
//     }
//   });