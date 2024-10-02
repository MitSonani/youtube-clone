const { ayncHandler } = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const Tweet = require("../models/tweet.model")


exports.createTweet = ayncHandler(async (req, res) => {
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Enter should not be null")
    }


    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })


    return res.status(200).json(
        new ApiResponse(201, tweet, "Tweet created succesfully")
    )


})

exports.getUserTweet = ayncHandler(async (req, res) => {

    const userTweets = await Tweet.find({ owner: req.user._id })
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: userTweets.length,
                userTweets
            },
            "ALl tweet get successfully")

    )
})

exports.updateTweet = ayncHandler(async (req, res) => {
    const { id } = req.query
    const { content } = req.body

    const tweet = await Tweet.findById(id)
    if (!tweet) {

        throw new ApiError(400, "Tweet does not exist")
    }
    if (!content) {
        throw new ApiError(400, "Content should not be null")

    }
    const updatedTweet = await Tweet.findByIdAndUpdate(id, {
        $set: {
            content: content
        }
    }, {
        new: true
    }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Updated successfully")
    )
})

exports.deleteTweet = ayncHandler(async (req, res) => {
    const { id } = req.query
    const tweet = await Tweet.findById(id)
    if (!tweet) {

        throw new ApiError(400, "Tweet does not exist")
    }

    await Tweet.findByIdAndDelete(id)
    return res.status(200).json(
        new ApiResponse(200, "delete successfully")
    )
})