import nodemailer from 'nodemailer'
import { userModel } from '../Schema/usersInfoSchema.js'
import {Resend} from 'resend'


const resend = new Resend('re_gBBRTvMV_9u5WiZuhjTaJTtuRLpBCGDs2')


export const socketEmailFunction = async (productDetails) => {
    console.log("Product Details:", productDetails);

    for (const product of productDetails) {
        if (product.sellerId) {
            try {
                const sellerEmail = await userModel.findById(product.sellerId);

                if (!sellerEmail) {
                    console.warn(`Seller not found for product ID: ${product.id}, sellerId: ${product.sellerId}`);
                    continue; // Skip to the next product
                }

                // console.log("Seller Email:", sellerEmail.email); // Log the sellerEmail object
                resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'obasaajibola04@gmail.com',
                    subject: 'Hello World',
                    html: '<p>You have an order placed for your  <strong>first email</strong>!</p>'
                });

            } catch (error) {
                console.error(`Error sending email for product ID: ${product._id}, sellerId: ${product.sellerId}:`, error);
                // Consider re-throwing the error or handling it in a more sophisticated way
                // depending on your application's requirements.
            }
        } else {
            console.warn(`Product ID: ${product._id} missing sellerId. Skipping email.`);
        }
    }
};
