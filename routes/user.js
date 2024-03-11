const express = require('express');
const zod = require('zod');
const { User, Account } = require('../db');
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../config');
const { authMiddleware } = require('../middleware');
const router = express.Router();


const  signupSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
})
router.post('/signup',async (req, res) => {
    const body = req.body;
    const {success}= signupSchema.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg:"Email already taken / Incorrect inputs"
        })
    }
//existing user
    const user = await User.findOne({ 
        username:body.username       
    }) 

    if(user){
        return res.json({
            msg:"Email already taken / Incorrect"
        })
    }

   const dbuser =  await User.create(body)

   const userId = dbuser._id
   console.log(userId)
//-----------------Create New Account

await Account.create({
    userId,
    balance:1 + Math.random() * 10000
})
  //------------------------
   const token = jwt.sign({
    userId,
   },JWT_SECRET)
   res.status(200).json({
    msg: "User created successfully",
    token: token
   })
})



const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

router.post("/signin", async(req, res) => {
    const {success} = signinBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            msg:"Incorrect Inputs"
        })
    }

    const user = await User.findOne({
        username:req.body.username,
        password: req.body.password
    })

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET)

        res.json({
            token:token
        }) 
        return
    }

    res.status(411).json({
        msg:"Error while Logging in"
    })
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async(req, res)=>{
    const { success } = updateBody.safeParse(req.body)
    if(!success){
        res.status(411).json({ 
            message:"Error while updating password"
        })
    }
    await User.updateOne({ _id: req.userId}, req.body);

    res.json({
        msg: "Updated successfully"
    })
})


router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;