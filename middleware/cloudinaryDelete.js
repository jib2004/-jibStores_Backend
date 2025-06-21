import { v2 as cloudinary } from 'cloudinary';


export const imageDelete = async(files) =>{
    cloudinary.config({
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ,
        api_secret:process.env.CLOUDINARY_SECRET_API_KEY
    })

    for(const file of files){
        await cloudinary.uploader.destroy(file)
    }
}

