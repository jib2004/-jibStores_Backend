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

       // Case 1: File is a Buffer (from <input type="file">)
      if (file.buffer) {
        result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              transformation: [
                { width: 270, height: 250, crop: "fill" },
                { quality: "auto" },
                { fetch_format: "auto" }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer); // Upload the buffer directly
        });
      }
      // Case 2: File is a URL string (user provided a link)
      else if (typeof file === "string") {
        result = await cloudinary.uploader.upload(file, {
          resource_type: "image",
          transformation: [
            { width: 270, height: 250, crop: "fill" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        });
      }
      // Case 3: Invalid format
      else {
        throw new Error("Unsupported file format. Expected Buffer or URL.");
      }

        urls.push(result.public_id)
    }
    return urls
}

