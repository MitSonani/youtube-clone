const { ayncHandler } = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const Video = require("../models/video.model")
const Comment = require("../models/comment.model")


exports.addComments = ayncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    const video = Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "This video not found")
    }

    if (!content) {
        throw new ApiError(404, "Content field should not be null")
    }

    const commentedVideo = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!commentedVideo) {
        throw new ApiError(500, "something going wrong while create comment")
    }

    return res.status(200).json(
        new ApiResponse(201, commentedVideo, "Sucessfully commented")
    )

})

exports.getVideoComments = ayncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const video = Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "This video not found")
    }

    const skip = (page - 1) * limit
    const getcomments = await Comment.find({ video: videoId }).skip(skip).limit(limit).select("-owner -video")

    if (getcomments.length < 1) {
        throw new ApiError(400, "No comment found")
    }
    const totalComments = await Comment.countDocuments({ video: videoId });
    return res.status(200).json(
        new ApiResponse(200, { count: totalComments, getcomments }, "All comments get")
    )
})


exports.updateComment = ayncHandler(async (req, res) => {
    const { id } = req.query
    const { content } = req.body

    if (!id) {
        throw new ApiError(400, "Id not found")
    }
    const findComment = await Comment.findById(id)

    if (!findComment) {
        throw new ApiError(400, "Comment document not found")
    }

    if (content.trim() === "") {
        throw new ApiError(400, "comment should not be null")
    }
    let updatedComment = await Comment.findByIdAndUpdate(id, {
        $set: {
            content: content
        }
    },
        {
            new: true
        })
    if (!updatedComment) {
        throw new ApiError(500, "Something wrong while updating the comment")
    }


    return res.status(200).json(
        new ApiResponse(200, updatedComment, "comment updated succesfully")
    )
})

exports.deleteComment = ayncHandler(async (req, res) => {
    const { id } = req.query


    if (!id) {
        throw new ApiError(400, "Id not found")
    }
    const findComment = await Comment.findById(id)

    if (!findComment) {
        throw new ApiError(400, "Comment document not found")
    }


    let updatedComment = await Comment.findByIdAndDelete(id)
    if (!updatedComment) {
        throw new ApiError(500, "Something wrong while updating the comment")
    }


    return res.status(200).json(
        new ApiResponse(200, {}, "comment deleted succesfully")
    )
})