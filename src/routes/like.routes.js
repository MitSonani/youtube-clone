const express = require('express')
const router = express.Router()
const verifyJWT = require('../middelwares/auth.middelware')
const { toggleVideoLike, toggleCommentLike } = require('../controllers/like.controller')


router.route("/toggleVideoLike/:videoId").put(verifyJWT, toggleVideoLike)
router.route("/toggleCommentLike/:commentId").put(verifyJWT, toggleCommentLike)

module.exports = router