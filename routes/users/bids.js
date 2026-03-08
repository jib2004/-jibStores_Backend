import Bid from "../../Schema/bidSchema.js";
import { StatusCodes } from "http-status-codes";
import express from 'express'
import { generateRandomString } from "../../lib/stringGenerator.js";
import { userModel } from "../../Schema/usersInfoSchema.js";
import { client } from "../../configurations/redisConfig.js";


const bidRouter = express.Router()

bidRouter.post('/create-bid/:id', async(req,res)=>{
    const {id} = req.params
    const {name,description,startingPrice,image,endTime} = req.body
    if(!name|| !description|| !image|| !endTime){
        return res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            message:'Kindly fill all field'
        })
    }
    let randomString = generateRandomString(6)
    const date = new Date()
    try {
        // const client = await getRedisClient();
        const user = await userModel.findById(id)

        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({
                status:false,
                message:"User not found!"
            })        
        }

        const isUserPaid = await Bid.findOne({userId:user.id})

        if(!isUserPaid || !isUserPaid.isPaid){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status:false,
                message:"Only users who have paid can place a bid" 
            })
        }

        await client.hSet(`user:${id}-${randomString}`,{
            name,
            startingPrice,
            currentPrice:startingPrice,
            image,
            endTime,
            description,
            userId:id,
            startTime:date.toLocaleString(), 
            
        })

        const getHash = await client.hGetAll(`user:${id}-${randomString}`)

        const bidCache = await client.set(`user:${id}-${randomString}`,JSON.stringify(getHash))

        


    if(bidCache){
        await Bid.create({
            name,
            description,
            startingPrice,
            image,
            endTime,
            userId:user._id,
            reference:randomString,
            startTime:date.toLocaleString()
        })

        return res.status(StatusCodes.OK).json({
            status:true,
            message:'Successful'
        })
    }
    
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})

bidRouter.get('/get-bid/:id/:reference',async(req,res)=>{
    const {id,reference} = req.params

    try {
        // const client = await getRedisClient();
        const user = await userModel.findById(id)
        if(!user){ 
            return res.status(StatusCodes.NOT_FOUND).json({
                status:false,
                message:"User not found!"
            })   
        }

        const bidExists = await client.exists(`user:${id}-${reference}`)

        if(!bidExists){
            return res.status(StatusCodes.NOT_FOUND).json({
                status: false,
                message: "Bid doesn't exist"
            })
        }

        const getBidCache = await client.get(`user:${id}-${reference}`)
        const bidParsed = JSON.parse(getBidCache)

        return res.status(StatusCodes.OK).json({
            status:true,
            data:bidParsed
        })

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})


bidRouter.put('/place-bid/:id',async(req,res)=>{
    const {id} = req.params //id must be the 
    const {bidderId,amount} = req.body



    try {
        // const client = await getRedisClient();
        const date = new Date()
        const newBid = {
            bidderId,
            amount,
            bidTime: date.toLocaleDateString()
        }

        

        const findUserBid = await Bid.findById(id)

        if(!findUserBid){
            return res.status(StatusCodes.NOT_FOUND).json({
                status:false,
                message:'Bid Not Found'
            })
        }

        // if(findUserBid.userId.toString() !== id){
        //     return res.status(StatusCodes.UNAUTHORIZED).json({
        //         status:false,
        //         messege: 'You are not authorized to update this'
        //     })
        // }

        if( newBid.amount <= findUserBid.currentPrice ){
            return res.status(StatusCodes.BAD_REQUEST).json({
                status:false,
                message:`Bid amount must be greater than the current price of ${findUserBid.currentPrice}`
            })
        }

          await client.set(`bids:${findUserBid.id}`,JSON.stringify(newBid))
          await client.lPush(`bids:${findUserBid.id}-${findUserBid.reference}`, newBid)
        
        const updateBid = await Bid.findOneAndUpdate({
            userId:id
        },
        {
            $push:{
                bids:newBid
            },
            currentPrice:newBid.amount
        },
        {
            new:true

        }).populate('bids.bidderId', 'name email')


        if(!updateBid){
            return res.status(StatusCodes.NOT_FOUND).json({
                status:false,
                messsage:'Bid not found'
            })
        }

        return res.status(StatusCodes.OK).json({
            status:true,
            data:updateBid,
            highestBid: newBid,
            message: 'Bid placed successfully',
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})

bidRouter.get('/highest-bid/:id',async(req,res)=>{
    const {id} = req.params //Bid _Id

    try {
        // const client = await getRedisClient();
        const bidExists = await client.exists(`bids:${id}`)
        if(!bidExists){
            return res.status(StatusCodes.NOT_FOUND).json({
                status:false,
                massage: 'Highest bid not found!'
            })
        }

        const highestBid = await client.get(`bids:${id}`)
        if(!highestBid){
            return res.status(StatusCodes.BAD_REQUEST).json({
                status:false,
                massage: 'No bid has placed'
            })
        }

        const highestBidParsed = JSON.parse(highestBid)

        const highestBidInfo = await Bid.findById(id).populate('bids.bidderId', 'name email')

        

        return res.status(StatusCodes.OK).json({
            status:true,
            message: 'Highest Bid Found',
            data: highestBidParsed,
            userHighBid: highestBidInfo.bids.findLast(element => element.amount >  highestBidInfo.startingPrice)
        })

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})


bidRouter.get('/bid-list/:id/:reference',async(req,res)=>{
    const {id,reference} = req.params 
    
    //id -> _id
    try {
        // const client = await getRedisClient();
        const isBidExist = await Bid.findOne({
            _id:id,
            reference
        })

        if(!isBidExist){
            return res.status(StatusCodes.NOT_FOUND).json({
                message:"Bid Doesn't Exist",
                status:false
            })
        }

        const bidList = await client.lRange(`bids:${id}-${reference}`,0 , -1)

        res.status(StatusCodes.OK).json({
            status:true,
            message:'List Found Successfully',
            data:bidList
        })

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})




export default bidRouter


