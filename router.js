const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({extended: false})
const {
    createUserDb, getUserDb, createTempUser, pullUserFromTemp
    , deleteUserFromTemp, checkIfVerifiedIdExists, verifyUser,
    checkIfEmailExist, getUserDbByEmail, insertInfoForPasswordRecover, getInfoById,updatePassword,deleteByIdFromInfoTable
} = require('./repository/usersRepository')
const {sendEmailToVerifyUser, validateEmail, sendEmailForPasswordRecovery} = require('./services/EmailSenderService')
const {v4} = require('uuid');
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}


router.get('/', (req, res) => {

    res.send("server is up and runnig")

})

router.post('/register', jsonParser, async (req, res) => {

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
        const {exist} = await verifyUser(req.body)
        if (exist) {
            res.status(exist.status).send(exist.message)
            return
        }

        const {error, send} = await sendEmailToVerifyUser(req.body)
        if (error) {
            res.status(error.status).send(error.message)
            return
        }
        const {action} = await createTempUser(req.body)
        res.status(action.status).send(action.message)
    } catch (e) {
        console.log(e)
    }

})

router.post('/login', jsonParser, async (req, res) => {

    console.log(req.body)
    const {error, user} = await getUserDb(req.body)
    if (error) {

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


router.get('/validation', (req, res) => {
    res.redirect(process.env.CLIENT_URL)

})

router.get('/validation/:verificationId', async (req, res) => {
    try {
        const {error, user} = await pullUserFromTemp(req.params.verificationId)
        if (error) {
            res.redirect(process.env.CLIENT_URL)
            return
        }

        console.log("the user is :", user)
        const {errordb} = await createUserDb(user)
        if (errordb) {
            res.send(errordb)
            return
        }
        res.redirect(`${process.env.CLIENT_URL}/email-confirmed/${req.params.verificationId}`)

    } catch (e) {
        throw e
    }
})

router.post('/validation', jsonParser, async (req, res) => {
    try {
        if (!req.body.verifiedId) {
            res.status(400).send('something went wrong')
            return
        }
        if (await checkIfVerifiedIdExists(req.body.verifiedId)) {
            res.status(200).send('id found')
            deleteUserFromTemp(req.body.verifiedId)
            return
        }

        console.log('recieved ', req.body)
        res.status(404).send('id not found!')
    } catch (e) {
        console.log(e)
    }
})


router.post('/password-recovery', jsonParser, async (req, res) => {
    try {
        if (!req.body.email) {
            res.status(400).send('No Email recieved')
            return
        }
        const email = req.body.email
        if (!validateEmail(email)) {
            res.status(400).send('Invalid Email')
            return
        }
        if (!await checkIfEmailExist(email, 'tb_users')) {
            res.status(404).send('This email does not exists in our system!')
            return
        }

        const userDb = await getUserDbByEmail(email)

        const informationForRecover = {
            email: email,
            firstName: userDb.first_name,
            lastName: userDb.last_name,
            userName: userDb.user_name,
            id: v4()
        }
        console.log(informationForRecover)
        await sendEmailForPasswordRecovery(informationForRecover)
        insertInfoForPasswordRecover(informationForRecover)
        res.status(200).send('Request Succesful!')


    } catch (e) {
        console.log(e)
        res.status(500).send('internal error')
    }
})

router.get('/password-reset-form/:id', async (req, res) => {
    try {
        const {email} = await getInfoById(req.params.id)

        if (!email) {
            res.redirect(process.env.CLIENT_URL)
            return
        }
            res.redirect(`${process.env.CLIENT_URL}/password-reset/${req.params.id}`)

    } catch (e) {
        res.status(500).send('internal error from 1')
    }
})

router.post('/password-reset-form', jsonParser, async (req, res) => {
    const {id,justVerify} = req.body

    if (!id) {
        res.status(400).send('Bad request')
        return
    }
    try {
        const {email} = await getInfoById(id)
        if (!email) {
            res.status(404).send('Request Not Found')
            return
        }
       if(justVerify) {
           res.status(200).send('found')
           return
       }
       const {password}= req.body
       if(!password){
           res.status(400).send('No new Password')
           return
       }
           const {action} = await updatePassword(password,email)
           res.status(action.status).send(action.message)
           deleteByIdFromInfoTable(id)

    } catch (e) {
        res.status(500).send('internal error from 2')
    }
})


module.exports = router