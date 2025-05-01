import  {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();


//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const uploadedResponse = await cloudinary.uploader.upload(
            localFilePath,{
                resource_type: "auto",
            }

        );
        console.log("File Uploaded Sucessfully!!.File src: ", uploadedResponse.url);
        fs.unlinkSync(localFilePath);
        return uploadedResponse;
    } catch (error) {
        console.error("Cloudinary Upload Error: ", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        if(!publicId) return null;
        const deletedResponse = await cloudinary.uploader.destroy(publicId);
        console.log("File Deleted Sucessfully!!.File src: ", deletedResponse.url);

    } catch (error) {
        console.error("Cloudinary Delete Error: ", error);

    }
}


export {uploadOnCloudinary , deleteFromCloudinary}