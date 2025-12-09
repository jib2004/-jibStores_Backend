import express from 'express'
import { verify } from '../../middleware/verify.js'
import { productModel } from '../../Schema/productDetailSchema.js'
import { userModel } from '../../Schema/usersInfoSchema.js'
import { StatusCodes } from 'http-status-codes'
import { Order } from '../../Schema/orderSchema.js'
import { generateRandomString } from '../../lib/stringGenerator.js'
// import { socketEmailFunction } from '../../middleware/socketCreation'
import { socketEmailFunction } from '../../middleware/socketCreation.js'



export const buyerRoute =  express.Router()




buyerRoute.get('/product',async(req,res)=>{
    try {
        const products =await productModel.find().select({
                isInspected:0,
                amountSold:0,
                keywords:0,
                isSold:0,
                sellerId:0,
                created_at:0
        })
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found." });
        }
        return res.status(200).json({data:products,message:"Successful"})
    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

buyerRoute.get('/product/:id/:userId',async(req,res)=>{
    const {id,userId} = req.params
    let isWishlist = false
    try {
        //    const isProductInWishlist = await userModel.find({ wishlist: { $in: [id] } });
           
        // // Check if the wishlist contains the product
        // if (isProductInWishlist.length > 0) {
        //     isWishlist = true; // Set to true if found
        // }

        const isProductInWishlist = await userModel.findById(userId)
        if( isProductInWishlist.wishlist.includes(id)){
            isWishlist = true; // Set to true if found
        }


        
        const products = await productModel.findById(id).select({
                isInspected:0,
                amountSold:0,
                keywords:0,
                isSold:0,
                created_at:0
        })
        if (!products) {
            return res.status(404).json({ message: "Product not found." });
        }
        return res.status(200).json({data:products,message:"Successful",wishlist:isWishlist})
    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error " + error
        })
    }
})

buyerRoute.get('/wishlist/:id',verify,async (req,res)=>{
    const { id } = req.params;

    try {
        const findUserWishlist = await userModel.findById(id).select({
            name:0,
            email:0,
            password:0,
            phoneNumber:0,
            address:0,
            role:0,
            otp:0,
            isVerified:0,
            isBlocked:0,
            searchHistory:0,
            cart:0,
            profilePicture:0,
            isChangedPassword:0,
            isSeller:0,
            CAC:0,
            isCACLegit:0,
            plan:0,
            subscription:0,
            sales:0,
            wallet:0
        })
        

        if(!findUserWishlist){
            return res.status(StatusCodes.NOT_FOUND).json({
                message:'User Not Found!'
            })
        }

        if(findUserWishlist.wishlist.length === 0){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:'Wishlist Empty!'
            })
        }

        return res.status(StatusCodes.OK).json({
            message:'Successful!',
            data:findUserWishlist,
        })


    } catch (error) {
          return res.status(500).json({
            message: "Internal Server Error: " + error
        });
    }
})


buyerRoute.put('/wishlist/:id', verify, async (req, res) => {
    const { id } = req.params;
    const { addWishlist } = req.body;

    // Check if addWishlist is provided
    if (!addWishlist) {
        return res.status(400).json({
            message: "Please add product to wishlist"
        });
    }

    try {
        // Await the result of the database operation
        const userId = await userModel.findById(id)
       const findProduct = await userModel.find({ wishlist: { $in: [addWishlist] } });
        if(findProduct.length > 0){
            const removeElement = userId.wishlist.filter(wish => wish !== addWishlist)
            userId.wishlist = removeElement
            await userId.save()
            return res.status(StatusCodes.OK).json({
                message: "Product Removed from wishlist"
            })
        }
        const user = await userModel.findByIdAndUpdate(
            id,
            {
                $push: {
                    wishlist: addWishlist
                }
            },
            { new: true }
        );

        // Check if user was found and updated
        if (!user) {
            return res.status(404).json({
                message: "User  not found"
            });
        }

        return res.status(200).json({
            message: "Product added to wishlist successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error: " + error
        });
    }
});

buyerRoute.get('/cart/:id',verify,async (req,res)=>{
    const { id } = req.params;

    try {
        const findUserCart = await userModel.findById(id).select({
            name:0,
            email:0,
            password:0,
            phoneNumber:0,
            address:0,
            role:0,
            otp:0,
            isVerified:0,
            isBlocked:0,
            searchHistory:0,
            wishlist:0,
            profilePicture:0,
            isChangedPassword:0,
            isSeller:0,
            CAC:0,
            isCACLegit:0,
            plan:0,
            subscription:0,
            sales:0,
            wallet:0
        })
        

        if(!findUserCart){
            return res.status(StatusCodes.NOT_FOUND).json({
                message:'User Not Found!'
            })
        }

        if(findUserCart.cart.length === 0){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:'cart Empty!'
            })
        }

        return res.status(StatusCodes.OK).json({
            message:'Successful!',
            data:findUserCart,
        })


    } catch (error) {
          return res.status(500).json({
            message: "Internal Server Error: " + error
        });
    }
})

buyerRoute.put('/cart/:id', verify, async (req, res) => {
    const { id } = req.params;
    const { addCart } = req.body;

    // Check if addCart is provided
    if (!addCart) {
        return res.status(400).json({
            message: "Please add product to wishlist"
        });
    }

    try {
        // Await the result of the database operation
        const userId = await userModel.findById(id)
        if(!userId){
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User not found"
            });
        }

        const findProduct = userId.cart.find(cart => cart === addCart);
        if(findProduct){
            const removeElement = userId.cart.filter(cart => cart !== addCart)
            userId.cart = removeElement
            await userId.save()
            return res.status(StatusCodes.OK).json({
                message: "Product Removed from cart"
            })
        }else{
             const user = await userModel.findByIdAndUpdate(
            id,
            {
                $push: {
                    cart: addCart
                }
            },
            { new: true }
        );

        // Check if user was found and updated
        if (!user) {
            return res.status(404).json({
                message: "User  not found"
            });
        }

        return res.status(200).json({
            message: "Product added to wishlist successfully",
            data: user,
            userFind:findProduct
        });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error: " + error
        });
    }
});

buyerRoute.post('/create-order/:id',verify,async(req,res)=>{
    const {productDetails,reference} = req.body
    const {id} = req.params
    try {
        const buyer = await userModel.findById(id)
        if(!buyer.address){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:'Kindly enter an address'
            })
        }

        

        buyer.cart = []
        await buyer.save()



        // You want to use socket.io to send email to the sellers that they have an order
        await socketEmailFunction(productDetails)

        const createOrder = await Order.create({
            buyerId:id,
            address:buyer.address,
            orderNumber:generateRandomString(10),
            productDetails,
            reference,
        })

        
        
        return res.status(StatusCodes.CREATED).json({
            message:"Successful",
            data:createOrder
        })
    } catch (error) {
         return res.status(500).json({
            message: "Internal Server Error: " + error
        });
    }
})

buyerRoute.get('/order/:id',verify,async(req,res)=>{
    const {id} = req.params
    if(!id){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message:'User ID is required'
        })
    }

    const buyerOrders = await Order.find({buyerId:id.toString()}).select({
        reference:0,
    })
    return res.status(StatusCodes.OK).json({
        message:'Successful',
        data:buyerOrders
    })


})

buyerRoute.get('/search/:query',async(req,res)=>{
    const {query} = req.params
    try {
        const searchResults = await productModel.find({ $text: { $search: query } }).select({
                isInspected:0,
                amountSold:0,
                keywords:0,
                isSold:0,
                sellerId:0,
                created_at:0
        })
        return res.status(StatusCodes.OK).json({
            message:'Successful',
            data:searchResults
        })
    }catch (error) {
         return res.status(500).json({
            message: "Internal Server Error: " + error
        });
    }
})