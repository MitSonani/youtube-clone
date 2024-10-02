const ApiError = require("../utils/ApiError")
const { ayncHandler } = require("../utils/asyncHandler")
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const verifyJWT = ayncHandler(async (req, _, next) => {
    try {

        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")


        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid accessToken")
        }
        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid token")
    }

})

module.exports = verifyJWT

