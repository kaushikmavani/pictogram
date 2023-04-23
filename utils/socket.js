const { Server } = require("socket.io");

let io;

module.exports = {
    init: port => {
        io = new Server(port);
        return io;
    },
    getIO: () => {
        if(!io) {
            console.log("Socket is not initialized!");
        }
        return io;
    }
}