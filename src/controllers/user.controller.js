const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const { ayncHandler } = require("../utils/asyncHandler")
const User = require('../models/user.model')
const uploadOnCloudnary = require('../utils/FileUpload')
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")


const genrateAccesAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = await user.genrateAccesToken();
        const refreshToken = await user.genrateRefreshToken();


        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    }
    catch (error) {

        throw new ApiError(500, "Somethig went wrong while genrating tokens")
    }
}

exports.registerUser = ayncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({

        $or: [{ username }, { email }]
    })


    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }
    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar image is required")
    }
    const avatar = await uploadOnCloudnary(avatarLocalpath)
    const coverImage = await uploadOnCloudnary(coverImageLocalPath)




    if (!avatar) {
        throw new ApiError(400, "Avatar image is not uploaded on server")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        password,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user?._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered sucessfully"))


})

exports.loginUser = ayncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!email && !username) {
        throw new ApiError(409, "Username or email required")
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(409, "Invalid user credentials")
    }
    const { accessToken, refreshToken } = await genrateAccesAndRefreshToken(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "user Logged in Successfully")
    )

})

exports.logoutUser = ayncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }

    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new ApiResponse(200, {}, "user loggedOut")
    )

})

exports.createNewRefreshToken = ayncHandler(async (req, res) => {

    try {
        let incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized");
        }
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(404, "invalid refreshtoken");
        }

        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(404, "refreshToken is expired");
        }


        let options = {
            httpOnly: true,
            secure: true
        }

        let { newAccessToken, newRefreshToken } = await genrateAccesAndRefreshToken(user._id)

        return res.status(200).cookie("accessToken", { accessToken: newAccessToken }, options).cookie("refreshToken", { refreshToken: newRefreshToken }, options).json(
            new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Access Toekn refreshed")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }



});

exports.changePassword = ayncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(req.user._id)



    let isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "old password is Invalid")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, "Password changed sucessfully"))




})

exports.currentUser = ayncHandler(async (req, res) => {

    return res.status(200).json(
        200, req.user, "user get sucessfully"
    )
})

exports.updateUserDetails = ayncHandler(async (req, res) => {
    let { email, fullname } = req.body

    if (!email && !fullname) {
        throw new ApiError(400, "please send details")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        {
            new: true
        }
    ).select("-passwoed")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "details updated")
    )

})

exports.updateUserAvatar = ayncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }
    const avatar = await uploadOnCloudnary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(500, "error while avatar is upload on server")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }, {
        new: true
    }).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar is updated")
    )


})

exports.updateCoverImage = ayncHandler(async (req, res) => {
    const coverImagePath = req.file?.path
    if (coverImagePath) {
        throw new ApiError(400, "cover file is missing")
    }
    const newcoverImagePath = await uploadOnCloudnary(avatarLocalPath)

    if (!newcoverImagePath.url) {
        throw new ApiError(500, "error while avatar is upload on server")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: newcoverImagePath.url
        }
    }, {
        new: true
    }).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "CoverImagePath is updated")
    )


})


exports.getUserChannelProfile = ayncHandler(async (req, res) => {
    const username = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        }, {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed"
            }
        }, {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedCount: {
                    $size: "$subscribed"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                            then: true,
                            else: false
                        }
                    }
                },

            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                subscribedCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1


            }
        }

    ])

    if (!channel?.length) {
        throw new ApiError(400, "Channel does not exist")
    }
    return res.status(200).json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )

})

exports.getWatchHistory = ayncHandler(async (req, res) => {
    const user = await User.aggregate([

        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, user?.[0].watchHistory, "watch history fetched successfully")
    )
})