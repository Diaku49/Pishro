let io


const initializeSocketIO = async(server)=>{
try{
    io = require('socket.io')(server);
    io.on('connection',(SIO)=>{
        console.log('Client connected to socket.')
    });
    console.log('Socket.io initialized successfully.')
}
catch(err){
    console.error('Failed to initialized socket io.',err);
}
}

const socketIo ={
    init:async(httpserver)=>{
        io = require('socket.io')(httpserver)
        return io;
    },
    getIo:()=>{
        if(!io){
            throw new Error('socketio was not init.');
        }
        return io;
    }
}

module.exports = {initializeSocketIO,socketIo}