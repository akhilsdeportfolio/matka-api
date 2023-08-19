
const Ably = require('ably');

const ably = new Ably.Realtime.Promise({key:'ITntaQ.ixEZUw:81HymRNfy3Tol_Y8wN50yDQtCm4X80tI7QneOrRfpMk',useBinaryProtocol:true});

ably.connection.once('connected', (data) => {
    console.log("Succesfully connect to the websocket server",data)    
});
const gameChannel=ably.channels.get("game");
module.exports = {ably,gameChannel};