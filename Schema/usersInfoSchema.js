import {Schema,model} from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        require:true,
        min:3
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        // require:true,
        min:8
    },
    phoneNumber:{
        type:String,
        // require:true,
        default:"",
        max:11
    },
    address:{
        type:String,
        default:""
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    otp:{
        type:String,
        default:""
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    searchHistory:{
        type:[String],
        default:[],
    },
    cart:{
        type:[String],
        default:[],
    },
    wishlist:{
        type:[String],
        default:[],
    },
    profilePicture:{
        type:String,
        
    },
    isChangedPassword:{
        type:Boolean,
        default:false
    },
    // orders:{
    //     type:[Object],
    //     default:[{
    //         sellerId:'',
    //         orderNumber:'',
    //         orderStatus:'pending' | 'on-transit' | 'delivered',

    //     }],
    // },
    isSeller:{
        type:Boolean,
        default:false
    },
    CAC:{
        type:String,
        default:""
    },
    isCACLegit:{
        type:Boolean,
        default:false
    },
    plan:{
        type:String,
        enum:['free', 'basic','standard',''],
        default:""
    },
    subscription:{
        type:Object,
        default:{
            isSubscriptionActive:false,
            id:0,
            status:'',
            reference:'',
            amount:0,
            currency:'NGN',
            authorization_url:'',
            gateway_response:'',
            createdAt:'',
            paidAt:'',
            expiresAt:'',
        }
    },
    sales:{
        type:[Object],
        default:[]
    },
    wallet:{
        type:Object,
        default:{
            balance:[0],
            currency:"NGN",
            lastTransaction: "",
            lastTransactionDate: "",
            lastTransactionAmount: 0
            }
    }

},{
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
})


export const userModel = model('users',userSchema)