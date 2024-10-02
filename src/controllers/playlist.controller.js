const { ayncHandler } = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const Playlist = require("../models/playlist.model")
const Video = require("../models/video.model")


exports.createPlatlist = ayncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(400, "title or description is required")
    }

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!createdPlaylist) {
        throw new ApiError(500, "something wrong whlie playlist created")
    }
    return res.status(200).json(
        new ApiResponse(201, createdPlaylist, "Platlist created successfully")
    )
})

exports.getPlaylist = ayncHandler(async (req, res) => {


    const getPlaylist = await Playlist.find({ owner: req.user?._id })

    if (!getPlaylist) {
        throw new ApiError(404, "No playlist found")
    }
    return res.status(200).json(
        new ApiResponse(201, getPlaylist, "Platlist fetched successfully")
    )
})

exports.getPlaylistById = ayncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Please send Params")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist get succesfully")
    )

})

exports.addVideoToPlaylist = ayncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params


    if (!playlistId) {
        throw new ApiError(400, "Please send playlist params")
    }
    if (!videoId) {
        throw new ApiError(400, "Please send video params")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    let videoList = playlist.vidoes || []
    if (playlist.vidoes?.length == 0) {
        videoList = [];
    }

    if (playlist.vidoes?.includes(videoId)) {
        throw new ApiError(400, "Video is already in the playlist");
    }

    videoList.push(videoId)
    playlist.vidoes = videoList
    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200,
            playlist,
            "video add succesfully")
    )


})

exports.removeVideoFromPlaylist = ayncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Please send playlist params")
    }
    if (!videoId) {
        throw new ApiError(400, "Please send video params")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (!playlist.vidoes.includes(videoId)) {
        throw new ApiError(400, "this video doesnt exist in playlsit")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {
            vidoes: videoId
        }
    },
        {
            new: true
        })

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video removed from playlist")
    )
})

exports.deletePlayList = ayncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Please send playlist params")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "No Playlist found")
    }

    await Playlist.findByIdAndDelete(playlistId)
    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

exports.updatePlaylist = ayncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body


    if (name?.trim() == "" || description?.trim() == "") {
        throw new ApiError(400, "Please send in name")
    }

    if (!playlistId) {
        throw new ApiError(400, "Please send playlist params")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "No Playlist found")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name: name,
            description: description
        }
    },
        {
            new: true
        })

    if (!updatedPlaylist) {
        throw new ApiError(500, "somrthing wrong whlie update playlist")
    }
    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated")
    )
})