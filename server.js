var express = require('express');
var app = express();
// require('dotenv').config();

const cors = require('cors')
const { sizeScrapper, orderScrapper, runOrderScrapper, readOrderFile } = require('./scrapper')
// const corsOptions = {
//    origin: *
//    // origin: '165.232.147.215'
// }
// app.use(cors(corsOptions))
app.use(express.json())
// 

const appIO = { socket: null };

// var socketIOClient = require('socket.io-client');
// var sailsIOClient = require('sails.io.js');
// var io = sailsIOClient(socketIOClient);
// // Replace with the URL of your Sails.js WebSocket server
// io.sails.url = 'http://localhost:2854'; // Update with your Sails.js server URL

// io.socket.get('/api/v1/socket-connection', function serverResponded (body, JWR) {
//    // body === JWR.body
//    console.log('Sails responded with: ', body);
//    console.log('with headers: ', JWR.headers);
//    console.log('and with status code: ', JWR.statusCode);

//    // ...
//    // more stuff
//    // ...


//    // When you are finished with `io.socket`, or any other sockets you connect manually,
//    // you should make sure and disconnect them, e.g.:
//    io.socket.disconnect();

//    // (note that there is no callback argument to the `.disconnect` method)
//  });
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

      const result = await orderScrapper(data.cartItem, data.scrapper, appIO)
      console.log('result', result)
      res.json(result);
   } catch (error) {
      console.log(error)
   }
})

var server = app.listen(8988, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("atricent scrapper listening at http://%s:%s", host, port)
})

// console.log(require('socket.io'))

// var io = require('socket.io').listen(3000);
// io.on('connection', function (socket) {
//     console.log('connected:', socket.client.id);
//     socket.on('serverEvent', function (data) {
//         console.log('new message from client:', data);
//     });
//     setInterval(function () {
//         socket.emit('clientEvent', Math.random());
//         console.log('message sent to the clients');
//     }, 3000);
// });


const serveIO = require('http').createServer();
const io = require('socket.io')(serveIO);
const moment = require('moment')

console.log('appIO.socket:', appIO.socket);
io.on('connection', socket => {
   console.log('connected:', socket.client.id);
   appIO.socket = socket;
   appIO.socket.on('orderScrapper', function (data) {
      const momentFileName = moment().format('HHmmssSS')
      const asyncTask = runOrderScrapper(data.cartItem, data.scrapper, momentFileName)
      asyncTask.then(async (data) => {
         console.log('Async task has completed', data);
         console.log('Async task has completed', data.stdout);
         const order = await readOrderFile(data.stdout)
         appIO.socket.emit('orderScrapper', order);
      }).catch((error) => {
         console.error('Async task encountered an error:', error);
      });
   });

   // 
   appIO.socket.on('sizeScrapper', async function (data) {
      console.log('sizeScrapper data', data)

      // if its 15th delete it
      // for (const cartItem of data.carts) {
      //    const awaitedSizes = []
      //    console.log('cartItem.variations', cartItem.variations)
      //    for (const varItem of cartItem.variations) {
      //       console.log('varItem', varItem)
      //       const result = await sizeScrapper(varItem.link)
      //       if (result) {
      //          console.log('result', result)
      //          result.id = varItem.id
      //          awaitedSizes.push(result)
      //       } else {
      //          console.log('in else result', result)
      //          awaitedSizes.push({})
      //       }
      //    }
      //    console.log('server.js awaitedSizes: ', awaitedSizes)
      //    appIO.socket.emit('sizeScrapper', awaitedSizes);
      // }

      data.carts.forEach(async cartItem => {
         // const awaitedSizes = []
         console.log('cartItem.variations', cartItem.variations)
         cartItem.variations.forEach(async varItem => {
            console.log('varItem', varItem)
            const result = await sizeScrapper(varItem.link.link)
            if (result) {
               result.id = varItem.id
               console.log('result', result)
               // awaitedSizes.push(result)
               appIO.socket.emit('sizeScrapper', result);
            } else {
               console.log('in else result', result)
               const temp = {}
               temp.response = result
               temp.id = varItem.id
               appIO.socket.emit('sizeScrapper', temp);
            }
         })
         
         // console.log('server.js awaitedSizes: ', awaitedSizes)
         // appIO.socket.emit('sizeScrapper', awaitedSizes);
      });

   })

});
serveIO.listen(3030, function () {
   console.log('Socket strated at: 3030');
});

