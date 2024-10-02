const express = require('express')
const verifyJWT = require('../middelwares/auth.middelware')
const upload = require('../middelwares/multer.middelware')
const { publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideos } = require('../controllers/video.controller')
const router = express.Router()

router.route('/publishVideo').post(verifyJWT, upload.fields([
    {
        name: "vidoeFile",
        maxCount: 1
    },
    {
        name: "thumnnail",
        maxCount: 1
    }
]), publishAVideo)
router.route('/getAllVideos').get(verifyJWT, getAllVideos)
router.route('/getvideoById/:videoId').get(verifyJWT, getVideoById)
router.route('/updateVideo/:videoId').put(verifyJWT, upload.single("thumnnail"), updateVideo)
router.route('/deleteVideo/:videoId').delete(verifyJWT, deleteVideo)
router.route('/togglePublishStatus/:videoId').put(verifyJWT, togglePublishStatus)

module.exports = router