import { Schema,model } from "mongoose";

const paymentSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },

    transactionHistory:{
        type: Array,
        default: []
    }

    // email:{
    //     type:String,
    //     require: true,
    // },

    // currency:{
    //     type:String,
    //     default:'NGN'
    // },
    // status:{
    //     type:Boolean,
    //     default:false,
    //     require:true
    // },
    // receipt_number:{
    //     type:String,
    //     default:''
    // },
    // amount:{
    //     type:Number,
    //     require:true
    // },
    // gateway_response:{
    //     type:String,
    //     default:''
    // },
    // paid_at: {
    //     type: String,
    //     default: ''
    // },
    // created_at: {
    //     type: String,
    //     default: ''
    // },
    // channel: {
    //     type: String,
    //     default: ''
    // },
    // customer:{
    //     id:{
    //         type: Number,
    //         default: 0
    //     },
    //     email:{
    //         type:String,
    //         default:''
    //     },
    //     customer_code:{
    //         type:String,
    //         default:''
    //     }
    // },
    // plan_code:{
    //     type:String,
    //     default:''
    // },
    // planType:{
    //     type:String,
    //     default:''
    // },
    // log:{
    //     type:Array,
    //     default:[]
    // },
    // transaction_date:{
    //     type:String,
    //     default:''
    // },
    // authorization:{
    //     type:String,
    //     default:{
    //         authorization_code:'',
    //         last4:'',
    //         exp_month:'',
    //         exp_year:'',
    //         card_type:'',
    //         brand:'',
    //         country_code:'',
    //         bank:'',
    //         signature:'',
    //     }   
    // }

})


export const payment_model = model('payment',paymentSchema) 