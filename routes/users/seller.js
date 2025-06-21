import express from 'express'
import { verify } from '../../middleware/verify.js'
import { productModel } from '../../Schema/productDetailSchema.js'
import { userModel } from '../../Schema/usersInfoSchema.js'
import {StatusCodes,ReasonPhrases} from 'http-status-codes'
import { imageUrlUploader } from '../../middleware/imageUrlConverter.js'
import { upload } from '../../middleware/multer.js'
import { imageDelete } from '../../middleware/cloudinaryDelete.js'



export const sellerRoute =  express.Router()

sellerRoute.get('/product/:id',verify ,async(req,res)=>{
    const {id} = req.params
    if(!id){
        return res.status(400).json({message:"Invalid id"})
    }
    try {
        const products = await productModel.find({sellerId:id})
    if(!products){
        return res.status(404).json({message:"No product found"})
    }
        return res.status(200).json({
            data:products,
            message:"Products Found Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error: " + error
        })
    }
})


sellerRoute.get('/review/product/:sellerId/:id',verify,async(req,res)=>{
    const {id,sellerId} = req.params
    if(!id){
        return res.status(StatusCodes.BAD_REQUEST).json({message:"Invalid id"})
    }
    try {
        const product = await productModel.findById(id)
        if(!product){
            return res.status(StatusCodes.NOT_FOUND).json({message:"No product found"})
        }

        if (sellerId.trim() !== product.sellerId?.toString()) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'You are unauthorized to see this product information'
            });
        }

        return res.status(StatusCodes.OK).json({
                data:product,
                message:" Successful"
            })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message:"Internal Server Error: " + error
        })
    }
})


sellerRoute.post('/upload',verify,upload.array('files',12),async(req,res)=>{
    const files = req.files;
   // Check if files exist
   if (!files || files.length === 0) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message: 'No image was provided'
    });
}

// Check if the number of files exceeds the limit
if (files.length > 12) {
    return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Cannot take more than 12 images'
    });
}

try {
    const file = await imageUrlUploader(files);
    return res.status(StatusCodes.OK).json({
        message: 'Successful',
        data: file
    });
} catch (error) {
    console.log(error)
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error: " + error
        
    });
}
})


sellerRoute.post('/product/:id',verify,async(req,res)=>{
    const {id} = req.params
    
    const {sellerName,title,price,description,category,stock,isDisCount,discountedPrice,fileLink,uploadedImage,keywords} = req.body
    let files = undefined
    let file = undefined


    if(fileLink){
         files = fileLink
    }

    if( files.length > 12){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Cannot take more than 12 images'
        })
    }

    if(!sellerName || !title || !price || !description || !category || !stock  ){
        return res.status(400).json({
            message:'Kindly fill in the field'
        })
    }

    if(files){
        file = await imageUrlUploader(files)
    }

    
    
    try {
        const user = await userModel.findById(id)
        if(!user){
            return res.status(404).json({
                message:'User not found'
            })
        }

        if(sellerName !== user.name){
            return res.status(403).json({
                message:'Seller name does not match with the user'  
            })
        }

        if(!id){
            return res.status(400).json({
                message:'User id is required'
            })
        }

        console.log(file)
         const product = await productModel.create({
            sellerName,
            title,
            price,
            description,
            image:uploadedImage !== undefined ? uploadedImage : file ,
            category,
            sellerId:id,
            stock,
            isDisCount,
            discountedPrice,
            keywords
         })

         return res.status(StatusCodes.CREATED).json({
            message:'Product created successfully',
            data:product
         })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error: " + error
        })
    }

})



sellerRoute.get('/dashboard/:id',verify,async(req,res)=>{
    const {id} = req.params
    try {
        const user = await userModel.findById(id,{isSeller:true})
       const products = await productModel.find({sellerId:id})
        if(!user){
           return res.status(404).json({message:'user not found'})
        }

        if(user.isSeller === false){
            return res.status(403).json({message:'Unauthorized access you are not a registered seller'})
        }

        if(!products){
            return res.status(400).json({message:'No products listed'})
        }

        res.status(200).json({
            userDate:user,
            productData:products,
            message:'Successful'
        })

    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error: " + error
        })
    }
})

sellerRoute.put('/product/:sellerId/:id',verify,async(req,res)=>{
    const {id,sellerId} = req.params
    const {sellerName,title,price,description,image,category,stock,isDisCount,discountedPrice,keywords} = req.body
    if(!sellerName || !title || !price || !description || !image || !category || !stock){
        return res.status(400).json({
            message:'Kindly fill in the field',
        })
    }





    try {
       const product = await productModel.findByIdAndUpdate(id,{
        title,
        price,
        description,
        image,
        category,
        stock,
        isDisCount,
        discountedPrice,
        keywords
        },{new:true}
    )

        if(sellerId !== product.sellerId.toString()){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                messsage:'You are not authorized to update this product',
            })
        }

       if(!product){
        return res.status(404).json({message:'Product not found'})
       }
 
       return res.status(200).json({
        message:'Product updated successfully',
        data:product
       })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error: " + error
        })
    }

})


sellerRoute.delete('/product/:sellerId/:id',verify,async(req,res)=>{
    const {id,sellerId} = req.params
    if(!id){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message:'Invalid ID' + id
        })
    }

    if(!sellerId){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message:'Invalid SELLER_ID' + sellerId,
        })
    }
    try {
        const product = await productModel.findByIdAndDelete(id)
        await imageDelete(product.image)
        if(sellerId !== product.sellerId.toString()){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'You are unauthorized to delete this'
            })
        }
        await imageDelete(product.image)
        return res.status(200).json({
            message:'Product deleted successfully',
            data:product
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error: " + error
        })
    }
})


sellerRoute.put('/register/:id',verify,async(req,res)=>{
    const {id} = req.params
    const {plan} = req.body

    try {
        const user = await userModel.findByIdAndUpdate(id,{isSeller:true,plan:plan},{new:true})
        if (!user) {
            return res.status(404).json({ message: "User  not found." });
        }

        return res.status(200).json({data:user, message:"Updated Successfully"})
    } catch (error) {
                   return res.status(500).json({
                message:"Internal Server Error: " + error
            })
    }
})

sellerRoute.post('/delete-image-id',verify, async(req,res)=>{
    const {id} = req.body
    if(!id){
        return  res.status(StatusCodes.BAD_REQUEST).json({
            message:'No Id Provided'
        })
    }
    try {
        await imageDelete([id])
        return res.status(StatusCodes.OK).json({
            message:'This was successfully deleted'
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error: " + error
        })
    }

})