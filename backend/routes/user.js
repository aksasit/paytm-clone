const express = require("express")
const {z} = require("zod")
const jwt = require("jsonwebtoken")
const {User, Account} = require("../db")
const { JWT_SECRET } = require("../config")
const { authMiddleware } = require("../middlewares/authMiddleware")
const router = express.Router()


const signupBody = z.object({    
    username: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
    password: z.string().min(6)
})

const signinBody = z.object({
    username: z.string().email(),
    password: z.string().min(6)
})

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
})

router.post("/signup", async (req, res) => {
    const {success} = signupBody.safeParse(req.body)

    // Input Validation
    if(!success){
        return res.status(411).json({
            Message: 'Incorrect inputs'
        })
    }

    const existingUsername = await User.findOne({
        username: req.body.username
    }) 

    if(existingUsername) {
        return res.status(411).json({
            message: 'Email already taken'
        })
    }

    const user = await User.create({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password
    })

    const userId = user._id

    await Account.create({
        userId,
        balance: 1 + Math.random()*100000
    })

    // userId is the payload 
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    return res.status(200).json({
        message: 'User created successfully',
        token: token
    })

})

router.post("/signin", async (req,res) => {
    const success = signinBody.safeParse(req.body)

    if(!success) {
        return  res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if(user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET)

        return res.json({
            token: token
        })
    }

    res.status(411).json({
        message: "Error while logging in"
    })    

})

router.put("/", authMiddleware, async (req, res) => {
    const {success} = updateBody.safeParse(req.body)

    if(!success) {
        return res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne({
        _id: req.userId
    }, req.body)

    res.status(200).json({
        message: "Updated Successfully"
    })
})


router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || ""

    const users = await User.find({
        "$or": [
            {
                firstname: {
                    "$regex": filter
                }
            },
            {
                lastname: {
                    "$regex": filter
                }
            }
        ]
    })

    res.status(200).json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstName,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})

module.exports = router