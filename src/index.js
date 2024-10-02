const dotenv = require('dotenv')
dotenv.config()
const connectDB = require('./db/index')
const app = require('./app')



connectDB()
    .then(() => {

        app.on("error", (error) => {
            console.log(`MongoDB connection error:`, error)
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on PORT: ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log("mongoDb connection failure", error)
    }) 