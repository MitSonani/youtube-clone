const { ayncHandler } = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const Like = require("../models/like.model")
const Video = require("../models/video.model")
const Comment = require("../models/comment.model")

exports.toggleVideoLike = ayncHandler(async (req, res) => {
    const { videoId } = req.params

    const videoExist = await Video.exists({ _id: videoId })

    if (!videoExist) {
        throw new ApiError(404, "This video is not found")
    }

    const findIsLiked = await Like.findOne({ video: videoId, likedBy: req.user?._id })

    if (findIsLiked) {
        await Like.findByIdAndDelete(findIsLiked?._id)
        res.status(200).json(
            new ApiResponse(200, { isLiked: false }, "Video Unliked")
        )
    } else {
        const isLiked = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        if (!isLiked) {
            throw new ApiError(500, "something went wrong while like the video")
        }
        res.status(200).json(
            new ApiResponse(200, { "isLiked": true }, "Video liked")
        )
    }

})

exports.toggleCommentLike = ayncHandler(async (req, res) => {
    const { commentId } = req.params

    const commentExist = await Comment.findById(commentId)
    if (!commentExist) {
        throw new ApiError(404, "THis comment not found")
    }

    const isAlredyLiked = await Like.findOne({ comment: commentId, likedBy: req.user?._id })
    if (isAlredyLiked) {
        await Like.deleteOne({ comment: commentId })
        return res.status(200).json(
            new ApiResponse(200, {}, "comment unliked")
        )
    } else {
        const createLike = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        if (!createLike) {
            throw new ApiError(404, "something wrong while creating like")
        }

        return res.status(200).json(
            new ApiResponse(201, {}, "video liked")
        )
    }
})


exports.getLikedVideos = ayncHandler(async (req, res) => {


})