
const express = require('express')
const http = require('http')
const router = require("./router.js")
const app = express()
const server = http.createServer(app)
const socketio = require('socket.io')
const passport = require('passport')
const cookieSession = require('cookie-session')
const cors = require('cors')
app.use(cors())
const {addUser, removeUser, getUser, getUsersInRoom,} = require('./users.js')
const {getUserDbByUserName } = require('./repository/usersRepository')
require('./passports/passportGoogleConfig')
const PORT = process.env.PORT || 5000


const io = socketio(server,{cookie: false}).origins('*:*')

app.use(express.json())

app.use(cookieSession({
    name: 'login-session',
    keys: ['key1', 'key2']
}))

app.use(passport.initialize());
app.use(passport.session());


app.use(router)

io.on('connection', (socket) => {
    console.log("we have a new connection")
   // handleDisconnect()

    socket.on('join', async ({name, room,generatedId, isAuthed, authUser}, callback) => {

        console.log("The generated id ",generatedId)
        let verified = false

        if(isAuthed){
           name = `${name}`

           try {
               const userDb = await getUserDbByUserName(authUser.userName)
               if(userDb){
                   verified = true
               }

           }catch (e) {
               throw e
           }

       }
        const {error, user} = addUser({id: socket.id, name, room, generatedId, verified})
        if (error) return callback(error)
        if(!user){
            socket.emit('message', {user:{name:"admin", verified:true }, text: `Connection lost, Please Refresh page`})
            return
        }
        socket.emit('message', {user:{name:"admin", verified:true }, text: `${user.name} welcome to ${user.room}`})
        socket.broadcast.to(user.room).emit('message', {user:{name:"admin", verified:true }, text:`${user.name} has joined`})
        socket.join(user.room)
        io.to(user.room).emit('roomData',{room: user.room, users:getUsersInRoom(user.room)})


        callback()
    })

    socket.on('sendMessage',(message,callback) =>{
        const user = getUser(socket.id)
        if(!user){
            socket.emit('message', {user:{name:"admin", verified:true }, text: `Connection lost, Please Refresh page`})
            return
        }

        io.to(user.room).emit('message',{user:user, text: message})
        io.to(user.room).emit('roomData',{room: user.room, users:getUsersInRoom(user.room)})
        callback()

    } )

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
           io.to(user.room).emit('message',{user:{name:"admin", verified:true },text:`${user.name} has left`})
        }
    })
})



server.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`)
})