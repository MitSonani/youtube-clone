const cloudinary = require('cloudinary').v2;
const fs = require('fs')


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const uploadOnCloudnary = async (localFile) => {

    try {
        if (!localFile) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFile, {
            resource_type: 'auto'
        })
        // file has been uploaded sucessfully

        fs.unlinkSync(localFile);
        return response

    } catch (error) {
        fs.unlinkSync(localFile) ///remove locally saved temporary file if opration got failed
        return null
    }

}

module.exports = uploadOnCloudnary;



