import mongoose, { Schema,model } from "mongoose";

const orderSchema = new Schema({
    buyerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    },
    // sellerId:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'user',
    // },// Using socket.io to send notification to the seller email  through emit
    address:{
        type:String,
        require:true
    },
    orderNumber:{
        type:String,
        unique:true
    },
    orderStatus: {
    type: String,
    enum: ['processing', 'in-transit', 'delivered', 'canceled'],
    default: 'processing'
  },
    productDetails:{
        type:[Object],
        require:true,
   
    },
    reference:{
        type:Object,
        require:true,
    },
    dateOrdered:{
        type:Date,
        default:Date.now()
    }
},{
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
})


export const Order = model('order', orderSchema)