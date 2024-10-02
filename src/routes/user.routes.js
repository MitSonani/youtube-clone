const express = require('express')
const { registerUser, loginUser, logoutUser, createNewRefreshToken, changePassword, currentUser, updateUserDetails } = require('../controllers/user.controller')
const upload = require('../middelwares/multer.middelware')
const verifyJWT = require('../middelwares/auth.middelware')

const router = express.Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/genrateRefreshToken").post(createNewRefreshToken)
router.route("/changePassword").post(verifyJWT, changePassword)
router.route("/getUser").get(verifyJWT, currentUser)
router.route("/updateUserDetails").put(verifyJWT, updateUserDetails)
module.exports = router