import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import * as url from "url"
import authRouter from "./routes/users/auth.js"
import connectDb from "./middleware/connectDb.js"
import { sellerRoute } from "./routes/users/seller.js"
import { buyerRoute } from "./routes/users/buyer.js"
import bodyParser from "body-parser"


import { subscriptionChecker } from "./lib/subcriptionChecker.js"
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import bidRouter from "./routes/users/bids.js"
import paymentPlan from "./routes/admin/paymentPlan.js"

console.log("App starting...");
// Initialize dotenv first
dotenv.config()
const allowedOrigins = [
  "http://localhost:3000", 
  "https://jib-stores-client.vercel.app"
];

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});


export const redis_url = process.env.REDIS_URL

const app = express()


const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(limiter); // Apply the rate limiting middleware to all requests
app.use(helmet()); // Apply security headers




app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, //If credientials is true, the Access-Control-Allow-Origin header must not be set to '*'
  }),
)
app.use(cookieParser())

//Middleware to ensure database connection on each request
app.use(async (req, res, next) => {
  console.log('DB Connecting...')
  try {
    await connectDb(process.env.MONGODB_URI)
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    res.status(500).json({ message: "Database connection failed" })
  }
})


// connectDb(process.env.MONGODB_URI)

// Start the subscription checker cron job
// subscriptionChecker.start()

app.use(express.static("uploads")) // allows you access this file

app.get("/", async (req, res) => {
  try {
    res.send("Hello World")
  } catch (error) {
    res.status(500).json({
      message: `Internal Server Error ${e}`
    })
  }
    
})


app.get("/getImage", (req, res) => {})

//Admin
app.use("/admin/v1/payment-plan",paymentPlan)


//Users
app.use("/auth", authRouter)
app.use("/seller", sellerRoute)
app.use("/buyer", buyerRoute)
app.use("/user/v1/bids", bidRouter)

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5000, () => {
    console.log("server is running on port 5000")
  })
}

// Export as default function for Vercel
export default app
