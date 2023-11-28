var express = require('express');
var app = express();
// require('dotenv').config();

const cors = require('cors')
const { sizeScrapper, orderScrapper, runOrderScrapper, readOrderFile } = require('./scrapper')
const { cronJob } = require('./app/cronJob');

// const corsOptions = {
//    origin: *
//    // origin: '165.232.147.215'
// }
// app.use(cors(corsOptions))
app.use(express.json())


// const { exportSQL } = require("./exportSQL");
// const moment = require("moment")
const appIO = { socket: null };
// 
// cronJob()


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
app.post('/upload', async (req, res) => {

   var fs = require('fs');

   try {
      const fileStream = fs.createWriteStream('app/data/size_dump22.sql.gz');
      req.on('data', (chunk) => {
         fileStream.write(chunk);
      });

      req.on('end', () => {
         fileStream.end();
         console.log('File uploaded successfully!');
         res.writeHead(200, { 'Content-Type': 'text/plain' });
         res.end('File uploaded successfully!');
      });
   } catch (error) {
      console.log(error)
   }
})

var server = app.listen(8988, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("atricent scrapper listening at http://%s:%s", host, port)
})


const serveIO = require('http').createServer();
const io = require('socket.io')(serveIO);
const moment = require('moment');
// const { sizeDBImport } = require('./app/sizeDBImport');
// const { sizeMigration } = require('./app/sizeMigration');
const { sql2gzip } = require('./app/sql2gzip');
const { exportSQL } = require('./app/exportSQL');
const { producer } = require('./app/Queues/Producer');
const { consumer } = require('./app/Queues/Consumer');
const { processSize } = require('./app/prcessSize');

app.get('/', async function (req, res) {
   const fs = require('fs')
   try {
      // sizeDBImport()
      // await sizeMigration()
      sql2gzip()


      //   const order = await readOrderFile('order_20231018_202549.json', io)
      // console.log('Before emitting order =>', order)

      // return JSON.parse(order)
   } catch (error) {
      throw error
   }
   res.send('Hello World');
})
// const Bull = require('bull')
// const cartQueue = new Bull('cart-queue', 'redis://127.0.0.1:6379')
console.log('appIO.socket:', appIO.socket);
io.on('connection', socket => {
   console.log('connected:', socket.client.id);
   appIO.socket = socket;
   // 
   appIO.socket.on('orderScrapper', async function (data) {
      const momentFileName = moment().format('HHmmssSS')
      const asyncTask = runOrderScrapper(data.cartItem, data.scrapper, momentFileName)
      try {
         const data = await asyncTask;
         console.log('Async task has completed', data);
         console.log('Async task has completed', data.stdout);
         const newData = data.stdout.trim()
         console.log('Trimmed output', newData);
         const order = await readOrderFile(newData, io)
         console.log('Before emitting order =>', order)
         tempOrder = order
         appIO.socket.emit('orderScrapper', tempOrder);

      } catch (error) {
         appIO.socket.emit('testOne', "error");
         appIO.socket.emit('orderScrapper', "error orderscrapper");
         console.error('Async task encountered an error:', error);
      }
   });
   // 
   appIO.socket.on('sizeScrapper', async function (data) {
      // console.log('sizeScrapper data', data)
      // const {carts, uuid} = data
      // make new function for this process
      // add each call to the queue as a new job
      // cartQueue.add({uuid: data.uuid})
      const cartSizes = await processSize(data, io)


      // ---------------------------------- jugad






      // }


      console.log('cartSizes before emiting event-->', cartSizes)

      // for (let cartItem of cartSizes) {
      //    appResult[cartItem.id] = cartItem.error
      // }
      // console.log('appResult before emiting event-->', appResult)

      // appIO.socket.emit('sizeUpdate', appResult)
      appIO.socket.emit('sizeScrapperApp', cartSizes);
      // sails.config.globals.appSocket.emit('sizeScrapperApp', { cartSizes });
      cartSizes = [];
      // appResult = [];






   })
});
serveIO.listen(3030, function () {
   console.log('Socket strated at: 3030');
});


const fileName = moment().format('DhhmmssS') + '.sql'
const filePath = 'app/data/'
console.log('fileName + filePath', filePath + fileName)
// exportSQL(filePath, fileName)
// mysqldump -u <username> -p <password> --no-create-info <database_name> sizes brands > data.sql
// const { exec } = require('child_process');
// exec(`mysqldump -u doadmin -pAVNS_o9klOLdLGD5avJq3GMt --no-create-info -h dbaas-db-1815241-do-user-7338207-0.b.db.ondigitalocean.com -P 25060 atricent sizes brands > ${filePath + fileName}`, (error, stdout, stderr) => {
//    if (error) {
//       console.error(`exec error: ${error}`);
//       return;
//    }

//    console.log(`stdout: ${stdout}`);
//    console.log(`stderr: ${stderr}`);
// });


// ----------------------------------------------
// Receiver
// const net = require('net');
// const fs = require('fs');
// const { cronJob } = require('./app/cronJob');

// const receiver = new net.Socket();

// receiver.connect(3200, 'localhost', () => {
//   console.log('Receiver connected to sender');
//   const fileStream = fs.createWriteStream('app/data/size_dump22.sql.gz');
//   receiver.pipe(fileStream);
// });