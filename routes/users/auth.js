import express from 'express'
import { userModel } from '../../Schema/usersInfoSchema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateToken } from '../../middleware/otpGenerator.js'
import nodemailer from 'nodemailer'
import { verify } from '../../middleware/verify.js'
import axios from 'axios'
import moment from 'moment'
import { payment_model } from '../../Schema/paymentModel.js'
import { upload } from '../../middleware/multer.js'
import { imageUrlUploader } from '../../middleware/imageUrlConverter.js'
import { StatusCodes } from 'http-status-codes'
import { stat } from 'fs'



  const authRouter = express.Router()




authRouter.post('/register', upload.array('profile',1) ,async(req,res)=>{
    const {name,email,password,phoneNumber,address} = req.body
    let file = undefined
    if(!name || !email || !password ){
        return res.status(400).json({message:"Please fill all the fields"})
    }
    if(password?.length < 8) return res.status(400).json({messge:"Password too short"})
    
    const hashedPassword =  bcrypt.hashSync(password, 10)
    let hashedNumber =  ""
    if(hashedNumber){
        return    hashedNumber = bcrypt.hashSync(phoneNumber,10)
    }
    let hashedAddress =""

    if(address){
       return  hashedAddress =  bcrypt.hashSync(address,10)
    }


    

    try {
        const userEmail = await userModel.findOne({email})
        if(userEmail) return res.status(400).json({message:"User exists already"})
        const user = await userModel.create({
            name,
            email,
            password:hashedPassword,
            phoneNumber:hashedNumber,
            address:hashedAddress ,
            
        })

        const token =jwt.sign({userEmail:user.email,userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"30d" })
            res.cookie("token",token,{
                httpOnly:true,
                secure: true,
                sameSite: 'none',
                // maxAge: 24 * 60 * 60 * 1000 
            }).json({message:"Successfully logged in"})
    
        return res.status(201).json({ 
            message:"User created successfully",
            data:user
        })


    } catch (error) {
        return res.status(500).json({message:`Internal server error ${error}`})
    }

    
})

authRouter.post('/login',async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password) return res.status(400).json({message:"Please fill fields"})
        try {
            const user = await userModel.findOne({email})
            if(!user) return res.status(400).json({message:"User not found"})
            const isValidPassword =  bcrypt.compareSync(password,user.password)
            if(!isValidPassword) return res.status(400).json({message:"Invalid password"})
            const token =jwt.sign({userEmail:user.email},process.env.JWT_SECRET_KEY,{expiresIn:"20s" })
            res.cookie("token",token,{
                httpOnly:true,
                secure: true, 
                sameSite: 'none',
                // maxAge: 24 * 60 * 60 * 1000 
            }).json({message:"Successfully logged in",data:user})
        } catch (error) {
            return res.status(400).json({message:"Invalid email or password"})
        }
})


authRouter.get('/user-info/:id',verify,async(req,res)=>{
    const {id} = req.params
    try {
        const user = await userModel.findById(id).select({
            password:0,
            otp:0,
            __v:0,

        })
        if(!user) return res.status(404).json({message:"User not found"})
        if(user.isBlocked) return res.status(403).json({message:"User is blocked"})
        // if(!user.isVerified) return res.status(403).json({message:"User is not verified"})
        return res.status(200).json({data:user,message:"User found successfully"})
    } catch (error) {
        return res.status(500).json({message:`Internal server error: ${error}`})
    }

  })


authRouter.post("/send-otp",async(req,res)=>{
    const {email} = req.body
   
    if(!email){
        return res.status(400).json({"message":'Enter your email'})
    }

    const token = generateToken()
    
try{
   
    const userEmail = await userModel.findOne({email}) 
    if(!userEmail){
        return res.status(404).json({message:"User not found"})
}
    
  userEmail.otp = token
  userEmail.isChangedPassword = false
  await userEmail.save()

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    secure: true,
    auth:{
        user: process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})

const info = await transporter.sendMail({
    from:`"Wonder Boy" ${process.env.EMAIL}`,
    to: email,
    subject:`OTP-password `,
    text:`This is a one-time password ${token}`
    
})
 .catch(e=>console.log(e))
 


    return res.status(200).json({message:"OTP sent successfully",data:{
        email:userEmail.email,
        otp:userEmail.otp
    }})
    
}catch{
    return res.status(500).json({message:"Internal server error"})
}

    
})

authRouter.post("/verify-otp-email",async(req,res)=>{
    const {email,otp} = req.body
    try{
        const userEmail = await userModel.findOne({email}) 

    if(!userEmail){
        return res.status(404).json({message:"User not found"})
    }

    if(userEmail.otp !== otp){
        return res.status(400).json({message:"Invalid OTP"})
    }

    if(userEmail.isVerified === true){
        return res.status(400).json({message:"User verified already"})
    }

    if(userEmail.otp === otp){
        const updateEmail = await userModel.findOneAndUpdate({email},{
            otp: "",
            isVerified: true
        },{new:true})
    
        if(updateEmail.isVerified){
            return res.status(200).json({message:"OTP verified successfully",data:{
                email:updateEmail.email,
                otp:userEmail.otp
            }})
        }
    }
    }catch(e){
        return res.status(500).json({message:`Internal server error ${e}`})
    }
})


authRouter.put('/verify-otp-password',async(req,res)=>{
    const {email,otp}  = req.body
    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        if(user.otp !== otp){
            return res.status(400).json({message:"Invalid OTP"})
        }
        if(user.otp === otp){
            const updateEmail = await userModel.findOneAndUpdate({email},{
                otp: "",
                isChangedPassword: true
            },{new:true}
        )
    
        if(updateEmail.isChangedPassword){
            return res.status(200).json({message:"OTP successfully"})
        }
    }
            
    }catch(error){
        return res.status(500).json({message:`Internal server error: ${error}`})
    }
})


authRouter.put('/forgot-password',async(req,res)=>{
    const {email,password} = req.body
        if(password?.length < 8){
            return res.status(400).json({message:"Password must be at least 8 characters long"})
        }
    try {
        const newHashedPassword = bcrypt.hashSync(password,10)
        const user = await userModel.findOneAndUpdate({email},{
            password:newHashedPassword
        },{new:true})
        if(user && user.isChangedPassword){
            return res.status(200).json({message:"Password updated successfully",data:{
                email:user.email,
                password:user.password
            }})
        }

    } catch (error) {
        return res.status(500).json({message:`Internal server error: ${error}`})
    }
})


authRouter.post('/google-auth',async(req,res)=>{
    const {name,email,profilePicture} = req.body
    try {
        const user = await userModel.findOne({email})
        if(user){
            const token =jwt.sign({userEmail:user.email,userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"24h" })
            res.cookie("token",token,{
                httpOnly:true,
                secure: true,//https only
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }).json({message:"Successfully logged in"})
        }else{
            const newUser = await userModel.create({name,email,profilePicture})
            const token =jwt.sign({userEmail:newUser.email,userId:newUser._id},process.env.JWT_SECRET_KEY,{expiresIn:"24h" })
            res.cookie("token",token,{
                httpOnly:true,
                secure: true,//https only
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }).json({message:"Successfully logged in"})
            return res.status(201).json({ 
                message:"User created successfully",
                data:user
            })
        }
    } catch (error) {
        return res.status(500).json({message:`Internal server error: ${error}`})
    }
})


authRouter.put('/user/:id',async(req,res)=>{
    const {id} = req.params
    // const files = req.files
    const {name,email,plan,phoneNumber,address,searchHistory,cart,wishlist,order,isSeller} = req.body
    // let file = undefined
    try {
    //     if(files?.length !== 0){
    //         file = imageUrlUploader(files)
    //    }else{
    //        file = "https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg="
    //    }
        const user = await userModel.findByIdAndUpdate(id,{
            name,
            email,
            // profilePicture,
            plan,
            phoneNumber,
            address, 
            searchHistory,
            cart,
            wishlist,
            order,
            isSeller
        },{
            new:true
        })
        if(user){
            return res.status(200).json({message:"User updated successfully",data:user})
        }else{
            return res.status(404).json({message:"User not found"})
        }
        
    } catch (error) {
        return res.status(500).json({message:`Internal server error: ${error}`})
    }
})

authRouter.delete('/user/:id',verify,async(req,res)=>{
    const {id} = req.params
    try {
        const user = await userModel.findByIdAndDelete(id)
        if(user){
            return res.status(StatusCodes.OK).json({message:"User updated successfully",data:user})
        }else{
            return res.status(StatusCodes.NOT_FOUND).json({message:"User not found"})
        }

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:`Internal server error: ${error}`})
    }
})

// Route to create a Paystack plan
authRouter.post('/create-plan',verify ,async (req, res) => {
    let {email,plan,amount} = req.body
    const params = {
        email:email,
        plan: plan ,
        amount:amount * 100 ,
    };

    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', params, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`}, // Replace with your actual secret key
                'Content-Type': 'application/json'
                
            });
        const {reference,authorization_url}  =  response.data.data

        const user = await userModel.findOneAndUpdate({email},{
            'subscription.reference':reference,
            'subscription.authorization_url':authorization_url,
            'subscription.amount':amount ,
        },{
            new:true
        })
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        if (response.data.status){
            res.status(200).json({
                message: "Plan created successfully Kindly Make payment",
                data:response.data,
                user:user
            })
        }else{
            res.status(400).json({message: "Failed to create plan", data: response.data})
        }

       
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while making the request:' + error  });
    }
});


authRouter.post('/payment-verification',verify,async (req,res)=>{
    const {reference,email} = req.body

    if(!reference || !email){
        return res.status(404).json({message:"Reference or Email not found"})
    }



    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Replace with your actual secret key
                'Content-Type': 'application/json'
            }
        });

        const transactionData = response.data.data;

        if (transactionData.status === 'success') {
            // Payment was successful
            const user = await userModel.findOneAndUpdate({email},{
                isSeller:true,
                'subscription.isSubscriptionActive':true,
                'subscription.gateway_response':transactionData.gateway_response,
                'subscription.status':transactionData.status,
                'subscription.id':transactionData.id,
                'subscription.amount':transactionData.amount/100,
                'subscription.paidAt':transactionData.paidAt,
                'subscription.createdAt':transactionData.createdAt,
                'subscription.expiresAt':moment().add(30,'days').calendar(),
                plan:transactionData.plan_object.name
            },{
                new:true
            })

            if(!user){
                return res.status(404).json({message:"User not found"})
            }

            // if(user.subscription.expiresAt)
            
            let payment = await payment_model.findOneAndUpdate({userId:user._id},{
                $push:{
                    transactionHistory:transactionData
                }
            },{new:true})

            if(!payment){
                payment = await payment_model.create({
                    userId:user._id,
                    transactionHistory:[transactionData]
                })
            }


             res.status(200).json({
                message: "Transaction was successful",
                // data: transactionData,
                data:user,
                paymentData:payment
            })
            // Update your database accordingly
        } else {
            // Payment was not successful
            const user = await userModel.findOne({email})
            if(!user){
                return res.status(404).json({message:"User not found"})
            }
            let payment = await payment_model.findOneAndUpdate({userId:user._id},{
                $push:{
                    transactionHistory:transactionData
                }
            },{new:true})

            if(!payment){
                payment = await payment_model.create({
                    userId:user._id,
                    transactionHistory:[transactionData]
                    
                })
            } 
            res.status(400).json({
                message: transactionData.gateway_response,
                data: transactionData,
                paymentData:payment
            })
        }
    } catch (error) {
        console.error('Error verifying payment:', error.response ? error.response.data : error.message);
    }

})


authRouter.post('/cookie-check',verify,(req,res)=>{
    return res.status(200).json({message:"User is authenticated",status:true})
})




authRouter.post('/logout',(req,res)=>{
    res.clearCookie("token")
    return res.status(200).json({message:"Logged out successfully"})
})


export default authRouter
