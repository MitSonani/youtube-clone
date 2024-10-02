const express = require('express')
const router = express.Router()
const verifyJWT = require('../middelwares/auth.middelware')
const { createPlatlist, getPlaylist, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlayList, updatePlaylist } = require('../controllers/playlist.controller')



router.route('/createPlatlist').post(verifyJWT, createPlatlist)
router.route('/getPlaylist').get(verifyJWT, getPlaylist)
router.route('/getPlaylistById/:playlistId').get(verifyJWT, getPlaylistById)
router.route('/addVideoToPlaylist/:playlistId/:videoId').post(verifyJWT, addVideoToPlaylist)
router.route('/removeVideoFromPlaylist/:playlistId/:videoId').put(verifyJWT, removeVideoFromPlaylist)
router.route('/deletePlayList/:playlistId').delete(verifyJWT, deletePlayList)
router.route('/updatePlaylist/:playlistId').put(verifyJWT, updatePlaylist)

module.exports = router