import mongoose from "mongoose";

const paymentPlanSchema =  new mongoose.Schema({
    name:{
        type:String,
        require:true,
        min:3
    },
    amount:{
        type:Number,
        require:true
    },
    planId:{
        type:Number,
        default:0
    },
    interval:{
        type:String,
        enum:['monthly','weekly','yearly',''],
        default:''
    },
    currency:{
        type:String,
        default:"NGN"
    },
    status:{
        type:String,
        enum:['active','cancelled',''],
        default:''
    },
    plan_token:{
        type:String,
        default:''
    },
    duration:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

const PaymentPlan = mongoose.model('payment-plan',paymentPlanSchema)

export default PaymentPlan