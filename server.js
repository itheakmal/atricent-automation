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


const serveIO = require('http').createServer();
const io = require('socket.io')(serveIO);
const moment = require('moment')

app.get('/', async function (req, res) {
	const fs = require('fs')
   try {
      
	  const order = await readOrderFile('order_20231018_202549.json', io)
		console.log('Before emitting order =>', order)
	  
      return JSON.parse(order)
  } catch (error) {
      throw error
  }
   res.send('Hello World');
})

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
      let cartSizes = [];
      let appResult = {}
      for await (const cartItem of data.carts) {
         for (const varItem of cartItem.variations) {
            if (varItem?.link?.link) {

               const result = await sizeScrapper(varItem.link.link, io, varItem.id)
               if (result) {
                  for (let item of result) {
                     item.item = varItem
                     item.id = varItem.id
                  }

                  console.log('result', result)
                  const parsedSize = result
                  if (parsedSize.length) {
                     let tempID = null
                     const temp = parsedSize.map(ps => {
                        if (tempID !== ps.id) {
                           tempID = ps.id
                        }
                        const sample = ps.size_elements ? JSON.stringify(ps.size_elements) : ps.size_elements
                        return { ...ps, size_elements: sample }
                     })
                     console.log('tempID before emitting ==>', tempID)
                     console.log('temp before emitting ==>', temp)
                     // appIO.socket.emit('sizeUpdate', {data: temp, id: tempID})
                     // await Size.update({ variation: returnedItem.id }).set({ meta: temp })
                     // await deleteGeneratedFile(stdout)

                     const firstMatch = parsedSize.filter(size => {

                        const tempType = size.type !== null ? size.type.toLowerCase() : size.type
                        const tempLength = size.length !== null ? size.length.toLowerCase() : size.length

                        const givenType = size.item.size[0] !== null ? size.item.size[0].toLowerCase() : size.item.size[0]
                        const givenLength = size.item.size[1] !== null ? size.item.size[1].toLowerCase() : size.item.size[1]

                        return tempType === givenType && tempLength === givenLength
                     })

                     if (firstMatch.length) {
                        for (let item of firstMatch) {
                           if (item.size_elements !== null) {

                              console.log('item.item.size 1=======>', JSON.stringify(item.item.size))
                              const ele = item.size_elements.findIndex(sizeItem => sizeItem.toLowerCase() == item.item.size[2].toLowerCase())
                              console.log('ele', ele)
                              if (ele === -1) {
                                 const sizesReturned = {
                                    id: item.item.id,
                                    error: 'Size not available, wanna checkout other sizes'
                                 }
                                 cartSizes.push(sizesReturned)
                              }
                           } else {
                              const sizesReturned = {
                                 id: item.item.id,
                                 error: 'All sizes are out of stock'
                              }
                              cartSizes.push(sizesReturned)
                           }
                        }
                     } else {
                        let id = 0
                        for (let temp of parsedSize) {
                           id = temp.id
                           break
                        }
                        const sizesReturned = {
                           id: id,
                           error: 'No size available'
                        }
                        cartSizes.push(sizesReturned)
                     }

                  } else {
                     console.log('no data returned from the scrapper')
                  }
                  // appIO.socket.emit('sizeScrapper', result);
               } else {
                  console.log('in else result', result)
                  const temp = {}
                  temp.response = result
                  temp.id = varItem.id
                  // appIO.socket.emit('sizeScrapper', [temp]);
               }
            } else {
               console.log('in else result', result)
               const temp = {}
               temp.response = "Variation does not have link"
               temp.id = varItem.id
               cartSizes.push(temp)
            }
         }
      }


      // ---------------------------------- jugad






      // }


      console.log('cartSizes before emiting event-->', cartSizes)

      // for (let cartItem of cartSizes) {
      //    appResult[cartItem.id] = cartItem.error
      // }
      // console.log('appResult before emiting event-->', appResult)


      appIO.socket.emit('sizeScrapperApp', cartSizes);
      // sails.config.globals.appSocket.emit('sizeScrapperApp', { cartSizes });
      cartSizes = [];






   })
});
serveIO.listen(3030, function () {
   console.log('Socket strated at: 3030');
});

