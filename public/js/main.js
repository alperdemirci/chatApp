const socket = io();

const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Get user name and room from the QS
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
console.log(username, room)
// Message from the server
socket.on('message', message => {
    console.log('message',message)

    outputMessage(message)
})
socket.on('chatMessage', message => {
    console.log('chatMessage',message)
    outputMessage(message)

    //Scroll down to see the new message
    chatMessages.scrollTop = chatMessages.scrollHeight
})

socket.emit('joinRoom', {username, room})

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})
// Message Submit
chatForm.addEventListener('submit', e => {
    e.preventDefault()

    const msg = e.target.elements.msg.value;
    console.log('msg', msg);

    //Emiting a message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus()
})

// output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message')
    div.innerHTML = `<p class="meta "> ${message.username} <span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`

    document.querySelector('.chat-messages').appendChild(div);

}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room
}

//Add users to the DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}
