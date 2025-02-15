const {JWT_SECRET} = require("../config")
const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization
    
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({})
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        
        // For subsequent middleware or route handlers to use
        if(decoded.userId) {
            req.userId = decoded.userId
            next()
        } else {
            return res.status(403).json({})
        }        
    } catch {
        return res.status(403).json({})
    }
}


module.exports = {
    authMiddleware
}