import mongoose from "mongoose"

let isConnected = false // Track connection status

const connectDb = async (URI) => {
  // If already connected, return
  if (isConnected) {
    console.log("Using existing MongoDB connection")
    return
  }

  try {
    const db = await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })

    isConnected = db.connections[0].readyState === 1
    console.log("Connected to MongoDB")
  } catch (error) {
    console.log("MongoDB connection error:", error)
    throw error
  }
}

export default connectDb
// This code connects to a MongoDB database using Mongoose.
