// const ayncHandler = (requestHandler) => {
//     (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
//     }
// }



exports.ayncHandler = (requestHandler) => async (req, res, next) => {
    try {
        return await requestHandler(req, res, next)
    }
    catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}

