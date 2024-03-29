const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const{sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')

router.post("/users",  async (req,res) => {
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        token = await user.generateAuthToken()
        res.status(201).send({user, token})

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/users/me", auth, async (req,res) => {
    res.send(req.user)
})

router.post('/users/login', async(req,res) => {    
    try{  const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    }catch(e){
        res.status(400).send("Check username or password")

    }
})

router.post('/users/logout',auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    } catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth, async(req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()    
    } catch(e){
        res.status(500).send()
    }
})
router.get("/users/me", auth, async (req,res) => {
         res.send(req.user)
   
    }
 )

 router.patch('/users/me', auth ,async(req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name","email","password","age"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    // console.log(isValidOperation)

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try{

        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        // //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators: true})
        // if(!user) {
        //     return res.status(404).send()
        // }
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.delete('/users/me', auth, async(req,res) => {
    try {
        const user = await req.user.remove()
        sendGoodbyeEmail(user.email,user.name)

        if(!user){
            return res.status(400).send()
        }
        res.send(req.user)
    } catch(e){
        res.status(400).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image file'))
        }
        cb(undefined, true)
    }
})

// const errorMiddleware =(req,res,next) => {
//     throw new Error('From my middleware')
// }




router.post("/users/me/avatar", auth, upload.single('avatar'), async(req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    try{
        res.status(200).send()
    }catch(e){
        res.status(400).send(e)
    }
}, (error,req,res,next) => {
    res.status(400).send({error: error.message})
})

router.delete("/users/me/avatar", auth, async(req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    try{
        res.status(200).send()
    }catch(e){
        res.status(400).send(e)
    }
}, (error,req,res,next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
    if(!user || !user.avatar){
        throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
    }catch(e){
        res.status(400).send()

    }
})

const upload_docs = multer({
   limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(doc|docx|pdf)$/)){
            return cb(new Error('Please upload a valid document'))
        }
        cb(undefined, true)
}})

router.post("/users/me/document", auth, upload_docs.single('document'), async(req,res) => {
    req.user.document = req.file.buffer
    await req.user.save()
    try{
        res.status(200).send()
    }catch(e){
        res.status(400).send(e)
    }
}, (error,req,res,next) => {
    res.status(400).send({error: error.message})
})


module.exports = router