const express = require('express')
const router = express.Router()
const verifyJWT = require('../middelwares/auth.middelware')
const { addComments, getVideoComments, updateComment, deleteComment } = require('../controllers/comment.controller')

router.route('/addComments/:videoId').post(verifyJWT, addComments)
router.route('/getVideoComments/:videoId').get(verifyJWT, getVideoComments)
router.route('/updateComment').put(verifyJWT, updateComment)
router.route('/deleteComment').delete(verifyJWT, deleteComment)


module.exports = router