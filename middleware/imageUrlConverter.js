import { v2 as cloudinary } from 'cloudinary';


  

export const imageUrlUploader = async (files) =>{
    cloudinary.config({
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ,
        api_secret:process.env.CLOUDINARY_SECRET_API_KEY
    })


    const urls =[]
    let result = undefined

    for (const file of files){

        if(file.path){
            result = await cloudinary.uploader.upload(file.path,{
                resource_type:"image",
                transformation:[
                 { width: 270, height: 250, crop: "fill" }, // Resize and crop the image
                 { quality: "auto" }, // Automatically adjust quality
                 { fetch_format: "auto" } // Automatically select format
                ]
            })
        }else{
            result = await cloudinary.uploader.upload(file,{
                resource_type:"image",
                transformation:[
                 { width: 270, height: 250, crop: "fill" }, // Resize and crop the image
                 { quality: "auto" }, // Automatically adjust quality
                 { fetch_format: "auto" } // Automatically select format
                ]
            })
        }
        
            
      
        urls.push(result.public_id)
    }
    return urls
}

