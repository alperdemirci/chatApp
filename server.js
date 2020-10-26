const path = require('path')
const http = require('http')
const express = require('express')
const app = express()


const socketio = require('socket.io')


const server = http.createServer(app)
const io = socketio(server)

const formatMessage = require('./public/utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./public/utils/users')

//server this page to the frontend
app.use(express.static(path.join(__dirname, 'public')))
const chatbot = 'chatCord'
//run when client connects
io.on('connection',
    socket => {

    socket.on('joinRoom',({username, room}) => {
        const user = userJoin(socket.id, username, room);

        // Broadcast when a user connects
        socket.join(user.room)

        // Welcome to the user connecting
        socket.emit('message',formatMessage(chatbot, 'Welcome to the chat'))

        // Broadcast when a user connects, except the user connecting
        socket.broadcast.to(user.room).emit('message',formatMessage(chatbot, `${user.username} has joined to chat`))

        // Send users and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
    })
        //Client disconnects
        socket.on('disconnect',() => {
            const user = userLeave(socket.id)
            if (user) {
                io.to(user.room).emit('message', formatMessage(chatbot, `${user.username} has left the ${user.room}`))

                // Send users and room info
                io.to(user.room).emit('roomUsers',{
                    room:user.room,
                    users:getRoomUsers(user.room)
                })
            }

        })

        //Listen for chatMessage
        socket.on('chatMessage', (msg) => {
            const user = getCurrentUser(socket.id)
            //Emit the message to everybody
            io.to(user.room).emit('chatMessage',formatMessage(user.username, msg));
        })

    })

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
