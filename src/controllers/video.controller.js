const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const { ayncHandler } = require("../utils/asyncHandler")
const uploadOnCloudnary = require('../utils/FileUpload')
const Video = require("../models/video.model")


exports.publishAVideo = ayncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "title or description should no be null")
    }

    const localVideoFile = req.files.vidoeFile?.[0]?.path


    const localtumbnail = req.files.thumnnail?.[0]?.path

    if (!localVideoFile) {
        throw new ApiError(400, "please upload video")
    }
    if (!localtumbnail) {
        throw new ApiError(400, "please upload thumbnail")
    }

    const vidoeFileURL = await uploadOnCloudnary(localVideoFile)
    const thumnailURL = await uploadOnCloudnary(localtumbnail)

    const duration = vidoeFileURL?.duration

    const createVideo = await Video.create({
        title,
        description,
        vidoeFile: vidoeFileURL.url,
        thumnnail: thumnailURL.url,
        duration: duration,
        owner: req.user?._id
    })

    if (!createVideo) {
        throw new ApiError(500, "somthing wrong while trying to upload video")
    }

    return res.status(200).json(
        new ApiResponse(201, createVideo, "Video up[loaded successfully")
    )


})

exports.getVideoById = ayncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video doesnot exist")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "video get successfully")
    )
})

exports.getAllVideos = ayncHandler(async (req, res) => {
    const { page = 1, limit = 2 } = req.query

    const skip = (page - 1) * limit

    const getVidoes = await Video.find().skip(skip).limit(limit)

    if (!getVidoes) {
        throw new ApiError(400, "Video doesnot exist")
    }
    return res.status(200).json(
        new ApiResponse(200, getVidoes, "video get successfully")
    )

})

exports.updateVideo = ayncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body


    const localthumbnail = req.file?.path
    if (!localthumbnail && !title && !description) {
        throw new ApiError(400, "please upload thumnail or description or title")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "video not found")
    }

    let uploadThumnail = await uploadOnCloudnary(localthumbnail)

    const updateVideo = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title,
            description,
            thumnnail: uploadThumnail.url
        }
    }, {
        new: true

    })
    if (!updateVideo) {
        throw new ApiError(500, "something wrong while update video")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            updateVideo,
            "video updated")
    )

})


exports.deleteVideo = ayncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Please send Params")
    }

    const findVideo = await Video.findById(videoId)

    if (!findVideo) {
        throw new ApiError(400, "Video not found")
    }

    const deleteVideo = await Video.findByIdAndDelete(videoId)

    if (!deleteVideo) {
        throw new ApiError(500, "Vsomething wrong while deleting video ")
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )

})


exports.togglePublishStatus = ayncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Please send Params")
    }

    const findVideo = await Video.findById(videoId)

    if (!findVideo) {
        throw new ApiError(400, "Video not found")
    }

    const updatePublishStatus = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                isPublished: !findVideo?.isPublished
            }
        },
        {
            new: true
        }
    )

    if (!updatePublishStatus) {
        throw new ApiError(400, "somethinh wrong while updater publish status")
    }

    return res.status(200).json(
        new ApiResponse(200, updatePublishStatus, "Video publish status updated successfully")
    )


})