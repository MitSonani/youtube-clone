const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const userRouter = require('./routes/user.routes')
const tweetRouter = require('./routes/tweet.routes')
const vidoeRouter = require('./routes/video.routes')
const playlistRouter = require('./routes/playlist.routes')
const commentRouter = require('./routes/comment.routes')

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json({
    limit: "40kb"
}))
app.use(express.urlencoded({ extended: true, limit: "40kb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.use('/api/v1/user', userRouter)
app.use('/api/v1/tweet', tweetRouter)
app.use('/api/v1/video', vidoeRouter)
app.use('/api/v1/playlist', playlistRouter)
app.use('/api/v1/comment', commentRouter)


module.exports = app; 