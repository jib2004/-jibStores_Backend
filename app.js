import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
import * as url from "url"
import authRouter from "./routes/users/auth.js"
import connectDb from "./middleware/connectDb.js"
import { sellerRoute } from "./routes/users/seller.js"
import { buyerRoute } from "./routes/users/buyer.js"
import bodyParser from "body-parser"
import http from "http"
import { Server } from "socket.io"


// Initialize dotenv first
dotenv.config()



const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
)
app.use(cookieParser())

// Middleware to ensure database connection on each request
app.use(async (req, res, next) => {
  try {
    await connectDb(process.env.MONGODB_URI)
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    res.status(500).json({ message: "Database connection failed" })
  }
})

app.use(express.static("uploads")) // allows you access this file

app.get("/", (req, res) => {
  res.send("Hello World")
})

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error)
  })
})

app.get("/getImage", (req, res) => {})

app.use("/auth", authRouter)
app.use("/seller", sellerRoute)
app.use("/buyer", buyerRoute)

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5000, () => {
    console.log("server is running on port 5000")
  })
}

// Export as default function for Vercel
export default app
