const express = require('express')
const { createTweet, getUserTweet, updateTweet, deleteTweet } = require('../controllers/tweet.controller')
const verifyJWT = require('../middelwares/auth.middelware')
const router = express.Router()



router.route('/createTweet').post(verifyJWT, createTweet)

router.route('/getUsertwwet').get(verifyJWT, getUserTweet)

router.route('/updatetweet').put(verifyJWT, updateTweet)

router.route('/deleteTweet').delete(verifyJWT, deleteTweet)

module.exports = router