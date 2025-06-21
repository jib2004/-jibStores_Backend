import mongoose from "mongoose";


 const connectUri = async(URI) =>{
    try {
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
            });
    console.log("Connected to MongoDB");
    } catch (error) { 
        console.log(error)
    }
}


export default connectUri