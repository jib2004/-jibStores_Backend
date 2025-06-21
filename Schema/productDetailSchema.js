import mongoose, { Schema,model } from "mongoose";


const productSchema = new Schema({
    sellerName:{
        type: String,
        required: true
    },
    sellerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title:{
        type:String,
        required:true,
        min:3,

    },
    price:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
        min:3
    },
    image:{
        type:[String],
        required:true,
        default:[]
    },
    category:{
        type:String,
        required:true,
    },
    rating:{
        type:Object,
        default:{
            rate:[Number],
            count:0
        }
    },  
    reviews:{
        type:[String],
        default:[]
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    stock:{
        type:Number,
        require:true
    },
    isInspected:{
        type:Boolean,
        default:false
    },
    isDisCount:{
        type:Boolean,
        default:false
    },
    discountedPrice:{
        type:Number,
        default:0
    },
    amountSold:{
        type:Number,
        default:0
        
    },
    keywords:{
        type:[String],
        default:[]
    },
    isSold:{
        type:Boolean,
        default:false
    },
    

},
{
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
})

export const productModel = model('products',productSchema)