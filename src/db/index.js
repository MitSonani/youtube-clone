const mongoose = require('mongoose')
const DB_NAME = require('../constant.js')

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("MongoDB connected:", `Database connected: ${process.env.PORT}`);

    } catch (error) {
        console.log("Error in connection:", error)
        process.exit(1)
    }
}
module.exports = connectDB