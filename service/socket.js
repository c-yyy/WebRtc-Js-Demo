'use strict'

const socketServer = (app) => {
  const http = require('http').createServer(app, (req, res) => {
    const headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    res.writeHead(200, headers);
    res.end();
  })
  const io = require('socket.io')(http, {
    cors: {
      origin: "*",
    },
  })
  // io.set('origins', '*:*');
  http.listen(3479, '0.0.0.0')
  console.log('\x1b[32m', `----  ws://192.168.1.111:${3479}  ----`)

  const outputLog = (...args) => {
    io.emit(`Message from server >> ${args}`)
  }

  io.sockets.on('connection', socket => {
    const USERCOUNT = 2;

    socket.on('message', (room, data)=>{
      socket.to(room).emit('message',room, data);
    });
  
    socket.on('join', (room)=>{
      console.log('join ---', room)
      socket.join(room);
      const myRoom = io.sockets.adapter.rooms.get(room);
      const users = myRoom? myRoom.size : 0;
      console.debug('the user number of room is: ' + users);
  
      if(users < USERCOUNT){
        io.emit('joined', room, socket.id); //发给除自己之外的房间内的所有人
        console.log('joined')
        if(users === 1) {
          console.log('wait join')
          socket.to(room)
          io.emit('wait join', room, socket.id);
        }
      }else{
        socket.leave(room);	
        io.emit('full', room, socket.id);
      }
      //socket.emit('joined', room, socket.id); //发给自己
      //socket.broadcast.emit('joined', room, socket.id); //发给除自己之外的这个节点上的所有人
      //io.in(room).emit('joined', room, socket.id); //发给房间内的所有人
    });
  
    socket.on('leave', (room)=>{
      const myRoom = io.sockets.adapter.rooms.get(room);
      const users = myRoom? myRoom.size : 0;
      console.debug('the user number of room is: ' + (users-1));
      //socket.emit('leaved', room, socket.id);
      //socket.broadcast.emit('leaved', room, socket.id);
      socket.to(room)
      io.emit('bye', room, socket.id);
      io.emit('leaved', room, socket.id);
      console.debug('leaved', room, socket.id)
      //io.in(room).emit('leaved', room, socket.id);
    });
  })

  io.sockets.on('disconnect', socket => {
    console.log(socket, 'you have been disconnected')
    socket.disconnect()
    outputLog('you have been disconnected')
  })
}

module.exports = socketServer