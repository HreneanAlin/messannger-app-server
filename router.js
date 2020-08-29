const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({extended: false})
const {createUserDb, getUserDb , createTempUser, pullUserFromTemp, deleteUserFromTemp, checkIfVerifiedIdExists} = require('./repository/usersRepository')
const {sendEmailToVerifyUser} = require('./services/EmailSenderService')
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}


router.get('/', (req, res) => {
 // handleDisconnect()
    res.send("server is up and runnig")

})

router.post('/register', jsonParser, async (req, res) => {
    //handleDisconnect()
    // console.log(req.body)
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log(req.body)
    if (!req.body.password || !req.body.firstName ||
        !req.body.lastName || !req.body.email || !req.body.userName) {
        res.status(400).send("Entry in all fields required!")
        return
    }
    if (!req.body.verificationId) {
        res.status(400).send("Internal Error Occured!")
        return
    }
    try {
        const {action} = await createTempUser(req.body)
        await sendEmailToVerifyUser(req.body)
        res.status(action.status).send(action.message)
    }catch (e) {
        throw e
    }

})

router.post('/login', jsonParser, async (req, res) => {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //handleDisconnect()
    console.log(req.body)
    const {error, user} = await getUserDb(req.body)
    if (error) {
        // res.status = error.status
        // res.send(error.message)
        res.status(error.status).send(error.message)
        console.log(error)
        return
    }

    res.json({
        firstName: user.first_name,
        lastName: user.last_name,
        userName: user.user_name
    })
})


router.get('/validation',(req,res)=>{
    res.send('It seems you fallowed a broken link!')

})

router.get('/validation/:verificationId',async (req,res)=>{
try {
    const {error, user} = await pullUserFromTemp(req.params.verificationId)
    if (error) {
        res.send(error)
        return
    }

    console.log("the user is :", user)
    const {errordb}  = await createUserDb(user)
    if(errordb){
        res.send(errordb)
        return
    }
    res.redirect(`${process.env.CLIENT_URL}/email-confirmed/${req.params.verificationId}`)

}catch (e) {
    throw e
}
})

router.post('/validation',jsonParser,async (req,res)=>{
    try {
        if (!req.body.verifiedId) {
            res.status(400).send('something went wrong')
            return
        }
        if(await checkIfVerifiedIdExists(req.body.verifiedId)){
            res.status(200).send('id found')
            deleteUserFromTemp(req.body.verifiedId)
            return
        }

        console.log('recieved ', req.body)
        res.status(404).send('id not found!')
    }catch (e) {
        console.log(e)
    }
})


module.exports = router