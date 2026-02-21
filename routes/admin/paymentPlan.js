import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { flw } from '../../configurations/flutterWaveConfig.js'
import PaymentPlan from '../../Schema/paymentPlanSchema.js'

const paymentPlan = express.Router()

paymentPlan.get('/:planId', async(req,res)=>{
    const {planId} = req.params
    try {
        const plan = await PaymentPlan.findOne({
            planId
        })

        if(!plan){
            return res.status(StatusCodes.NOT_FOUND).json({
            status:false,
            message:'Plan not found!'
        })
        }

        return res.status(StatusCodes.OK).json({
        status:true,
        message:'Plan Found!',
        data: plan,
    })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})

paymentPlan.get('/get-all-plans',async(req,res)=>{
    try {
        const response = await flw.PaymentPlan.get_all()
        return res.status(StatusCodes.OK).json({
            status:true,
            data:response.data,
            message:'Fetched all plans!'
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})

paymentPlan.post('/create-plan',async(req,res)=>{
    const {name,amount,interval} = req.body
    try {
    if(!name || !amount){
        return res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            message:'Kindly enter a name or an amount'
        })
    }
    const response = await flw.PaymentPlan.create({
        name,
        amount,
        interval
    })

    if(!response){
        return res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            message:'Plan not created!'
        })
    }

    const plan = await PaymentPlan.create({
        ...response.data,
        planId: response.data.id
    })

    return res.status(StatusCodes.CREATED).json({
        status:true,
        message:'Plan created successfully!',
        data: plan,
    })

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
        })
    }
})


paymentPlan.put('/update-plan/:planId',async(req,res)=>{
const {name,status} = req.body
const {planId} = req.params
    if(!name  || !status){
            return res.status(StatusCodes.BAD_REQUEST).json({
                status:false,
                message:'Kindly enter a name or an amount'
            })
    }
try {
    const updatePlan = await PaymentPlan.findOneAndUpdate({
        planId
    },{
        name,
        status
    },{
        new: true
    })

    if(!updatePlan){
        return res.status(StatusCodes.NOT_FOUND).json({
            status:false,
            message:"Plan not found!"
        })
    }

    const response = await flw.PaymentPlan.update({ 
        id:planId,
        name,
        status
    })

    if(!response){
        return res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            message:"Plan not updated!"
        })
    }

    res.status(StatusCodes.OK).json({
        status:true,
        data:updatePlan,
        response,
        message:'Plan Updated!'
    })


} catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
    })
}
})

paymentPlan.put('/cancel-plan/:planId',async(req,res)=>{
const {planId} = req.params
    try {
    const getPlan = await PaymentPlan.findOneAndUpdate({
        planId
    },{
        status:'cancelled'
    },{
        new:true
    })
    if(!getPlan){
        return res.status(StatusCodes.NOT_FOUND).json({
            status:false,
            message:"Plan not found!"
        })
    }

    const response = await flw.PaymentPlan.cancel({
        'id': planId 
    })

    if(!response){
        return res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            message:"Plan not cancelled!"
        })
    }

    return res.status(StatusCodes.OK).json({
        status:true,
        message:'Plan Cancelled!',
        response,
        data:getPlan
    })

} catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status:false,
            message: `Internal Server Error: ${error}`
    })
}
})

export default paymentPlan  