var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    var name = 'Guest ' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    namesUsed.push(name);
    return guestNumber+1;
}

function joinRoom(socket, room) {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {
        room: room
    });
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.'
    });

    var userInRoom = io.sockets.adapter.rooms.get(room).size;
    if (userInRoom.length > 1) {
        var info = 'Users currently in: ';
        for (var index in userInRoom) {
            var userSocketId = userInRoom[index].id;
            if (userSocketId != socket.id) {
                if (index > 0) {
                    info += ', ';
                }
                info += nickNames[userSocketId];
            }
        }
        userSocketId += '.';
        socket.emit('message', {text: info});
    }
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    socket.on('nameAttempt', (name) => {
        if (name.indexOf('Guest') == 0) {
            socket.emit('nameResult', {
                success: false,
                message: 'Name cannot begin with "Guest"'
            });
        } else {
            if (namesUsed.indexOf(name) == -1) {
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                delete namesUsed[previousNameIndex];
                socket.emit('nameResult', {
                    success: true,
                    name: name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                    text: previousName + ' is now known as ' + name + '.'
                });
            } else {
                socket.emit('nameResult', {
                    success: false,
                    message: 'Name is already in use'
                });
            }
        }
    });
}

function handleMessageBroadcasting(socket) {
    socket.on('message', (message) => {
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        })
    });
}

function handleRoomJoining(socket) {
    socket.on('join', (room) => {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
    });
}

function handleClientDisconnection(socket) {
    socket.on('disconnect', () => {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}

module.exports = {
    listen: function(http) {
        io = socketio(http);
        io.on('connection', (socket) => {
            guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
            joinRoom(socket, 'Lobby');
            handleMessageBroadcasting(socket, nickNames);
            handleNameChangeAttempts(socket, nickNames, namesUsed);
            handleRoomJoining(socket);

            // socket.on('rooms', () => {
            //     socket.emit('rooms', io.sockets.adapter.rooms);
            // });
            handleClientDisconnection(socket);
        });
    }
}