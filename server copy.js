var express = require('express');
var app = express();
// require('dotenv').config();

const cors = require('cors')
const { sizeScrapper, orderScrapper } = require('./scrapper')
// const corsOptions = {
//    origin: *
//    // origin: '165.232.147.215'
// }
// app.use(cors(corsOptions))
app.use(express.json())
// 
const io = require('socket.io-client');

// Replace with the URL of your Sails.js WebSocket server
const sailsSocketURL = 'http://localhost:2854'; // Update with your Sails.js server URL

const socket = io(sailsSocketURL);
console.log('socket',socket)
socket.on('connect', {url: '/api/v1/socket-connection'}, () => {
   console.log('Connected to Sails.js WebSocket');

   // Now you can send and receive messages
   socket.emit('chatMessage', 'Hello from the client');
});
socket.emit('get', {url: '/api/v1/socket-connection'}, function(res){
   console.log('res', res)
})

socket.on('chatMessage', (message) => {
   console.log('Received message from Sails.js server:', message);
});
socket.on('disconected', {url: '/api/v1/socket-connection'},  (message) => {
   console.log('Received message from Sails.js server:', message);
});
socket.on('error', function(e) {
   console.log(e);
   // Here I get 'Invalid namespace'
});
// Handle other events as needed

// 
app.get('/', function (req, res) {
   res.send('Hello World');
})
app.post('/size-scrapper', async (req, res) => {
   const data = req.body
   console.log('data', data)
   try {

      const result = await sizeScrapper(data.link)
      res.json(result);
   } catch (error) {
      console.log(error)
   }
})
app.post('/order-scrapper', async (req, res) => {
   const data = req.body
   console.log('data', data)
   try {

      const result = await orderScrapper(data.cartItem, data.scrapper)
      console.log('result', result)
      res.json(result);
   } catch (error) {
      console.log(error)
   }
})

var server = app.listen(8989, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("atricent scrapper listening at http://%s:%s", host, port)
})

