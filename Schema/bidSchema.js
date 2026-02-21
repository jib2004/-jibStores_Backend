import mongoose  from "mongoose";

const bidSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    name:{
        type:String,
        require:true,
        min:3
    },
    description:{
        type:String,
        require:true,
        min:10
    },
    startingPrice:{
        type:Number,
        require:true,
        min:0
    },
    currentPrice:{
        type:Number,
        min:0
    },
    image:{
        type:[String],
        require:true,
    },
    bids:{
        type:[{
            bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            amount: { type: Number, required: true },
            bidTime: { type: Date, default: Date.now }
        }],
        default:[]
    },
    status:{
        type:String,
        enum:["active","closed"],
        default:"active"
    },
    startTime:{
        type:Date,
        default: Date.now()
    },
    endTime:{ 
        type:Date,
        require:true,
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    reference:{
        type:String,
        default:''
    },
    
},{timestamps:true})

const Bid = mongoose.model("bids",bidSchema);

// mongoose.

export default Bid;