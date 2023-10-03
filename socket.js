

const serveIO = require('http').createServer();
const io = require('socket.io')(serveIO);
io.on('connection', socket => {
   
   console.log('connected:', socket, socket.client.id);
   // socket.on('serverEvent', function (data) {
   //     console.log('new message from client:', data);
   // });
   // setInterval(function () {
   //     socket.emit('clientEvent', Math.random());
   //     console.log('message sent to the clients');
   // }, 3000);

//   client.on('event', data => { /* … */ });
//   client.on('disconnect', () => { /* … */ });
});
serveIO.listen(3030);
