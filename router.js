const express = require('express')

const router = express.Router()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({extended: false})
const {createUserDb, getUserDb, handleDisconnect} = require('./repository/usersRepository')
console.log('diojaudiaisjduiajdiujauijduiejviufdbuyvdfauyfyuegfyue')


router.get('/', (req, res) => {
  handleDisconnect()
    res.send("server is up and runnig")

})

router.post('/register', jsonParser, async (req, res) => {
    handleDisconnect()
    // console.log(req.body)
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if (!req.body.password || !req.body.firstName ||
        !req.body.lastName || !req.body.email || !req.body.userName) {
        res.status(400).send("Entry in all fields required!")
        return
    }
    try {
        const {action} = await createUserDb(req.body)
        res.status(action.status).send(action.message)
    }catch (e) {
        throw e
    }

})

router.post('/login', jsonParser, async (req, res) => {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  handleDisconnect()
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

module.exports = router