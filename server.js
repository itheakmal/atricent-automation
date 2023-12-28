var express = require('express');
var app = express();
// require('dotenv').config();

const cors = require('cors')
const { sizeScrapper, orderScrapper, runOrderScrapper, readOrderFile } = require('./scrapper')
const { cronJob } = require('./app/cronJob');
const bodyParser = require('body-parser');
app.use(bodyParser.raw({ type: '*/*' }));
const serveIO = require('http').createServer();
const io = require('socket.io')(serveIO);
const moment = require('moment');

const amqp = require('amqplib/callback_api');
const connectionURL = 'amqps://pbflpqit:7WIa6sAxQYzZRZKGEX71mZm_ZgNqjkb8@moose.rmq.cloudamqp.com/pbflpqit';
let ch = null;
let response = null;
amqp.connect(connectionURL, function (err, conn) {
   conn.createChannel(function (err, channel) {
      ch = channel;
   })
})

// const { sizeDBImport } = require('./app/sizeDBImport');
// const { sizeMigration } = require('./app/sizeMigration');
const { sql2gzip } = require('./app/sql2gzip');
const { exportSQL } = require('./app/exportSQL');
const Pusher = require("pusher");
const pusher = new Pusher({
   appId: "1717205",
   key: "af4116b1b93517d7c40e",
   secret: "3c265f0cc2beb2f1a29c",
   cluster: "mt1",
   useTLS: true
});
// const corsOptions = {
//    origin: *
//    // origin: '165.232.147.215'
// }
// app.use(cors(corsOptions))
app.use(express.json())

/**
 * 
//
Processing job {"name":"mango","data":{"cartItem":{"brand":2,"tax":0,"fee":0,"shippingMethod":
{"fee":0,"time":null,"title":"Standard Shipping","atFee":7.598000000000001},
"paymentMethod":{"name":"stripe"},"variations":[{"id":8132,"size":[null,null,"XL"],"referalId":"5xvrtj9llq57svwv","quantity":"1","price":49.99,"status":"active","link":"https://shop.mango.com/us/men/jeans-skinny/jude-skinny-fit-jeans_57040734.html"},
{"id":9356,"size":[null,null,"XL"],"quantity":"1","price":25.99,"status":"active","link":"https://shop.mango.com/us/teen/t-shirts-and-tops-long-sleeve/ribbed-long-sleeved-t-shirt_57004030.html?c=99"}],"orderDetailID":381,"brandName":"Mango","address":
{"name":"Fk","firstName":"Mian","lastName":"Ali","address":"680 Amboy Ave","city":"Woodbridge","state":"New Jersey","zip":"07095","phone":"17324051053"}},"orderIDS":"210","scrapperName":"mango_order_place","detailedIDs":[381],"orderLimits":{"id":210,"uuid":"AT-2312229424-415","brands":[2],"totalAmount":8357,"status":"received","stripeStatus":"charge.succeeded","orders":[381],"details":
[{"brand":2,"variations":[8132,9356]}],"cartDetails":{"cart":[{"brand":2,"tax":0,"fee":0,"shippingMethod":{"fee":0,"time":null,"title":"Standard Shipping","atFee":7.598000000000001},"paymentMethod":{"name":"stripe"},"variations":[{"id":8132,"size":[null,null,"XL"],"referalId":"5xvrtj9llq57svwv","quantity":"1","price":49.99,"status":"active"},{"id":9356,"size":[null,null,"XL"],"quantity":"1","price":25.99,"status":"active"}],"orderDetailID":381}],"address":{"id":34,"city":"Woodbridge","state":"New Jersey","country":"United States","address":"680 Amboy Ave","zipCode":"07095","firstName":"Mian","lastName":"Ali","phoneNumber":"17324051053","defaultAddress":true,"updatedAt":"2023-12-20T10:18:03.000Z","createdAt":"2023-12-20T10:18:03.000Z","userProfile":6},"user":{"id":26,"active":true,"phoneNo":"3216603846","email":"xotickhan1@gmail.com","otp":null,"otpAt":null,"bearerToken":"1qCZQOyuv6laRf-G01pFlWT9nZOHF8_WDARnn8XSb8XqWj2HJnd-RNNgznezbFTD4NycDBJ4isLfW89kzalAdQOmZn79NbqcoFH-0A6FuLqtfNk97-lFoULLkgPM-1Ydc5qdAQ45mUs1OZExnyDlT4AvbY_Aygk4PwLiTnkc7p4","bearerCreatedAt":"2023-12-21T09:34:36.000Z","updatedAt":"2023-12-21T09:34:36.000Z","createdAt":"2023-10-17T16:01:45.000Z","referralId":"5xvrtj9llq57svkr","profile":{"id":6,"name":"Fk","username":"fky","gender":"female","verified":false,"avatar":null,"dob":"2000-05-04T00:00:00.000Z","skeleton":null,"firebaseToken":"d6sXvcOBQMaWKTWV51pnYD:APA91bGHDMDgAl8Y1QBIHD7YrdlbKLPxwlnxGBE2Ba4CYjvuB23FWQ-PO-71NUH9E1KBwiYohz39770_WmnTimKiGXljydX-fAGM-1iT1SCoyyUR_ph5uQI026HbDAL9SpJF2nI-5y87","notifications":null,"preferences":null,"biography":null,"language":null,"theme":null,"profileVisibility":true,"wardrobeVisibility":false,"feedVisibility":false,"listVisibility":false,"stripeCustomer":{"id":"cus_PDoUuNZGQ6nDva","object":"customer","address":null,"balance":0,"created":1703067503,"currency":null,"default_source":null,"delinquent":false,"description":null,"discount":null,"email":"xotickhan1@gmail.com","invoice_prefix":"9E9F0C04","invoice_settings":{"custom_fields":null,"default_payment_method":null,"footer":null,"rendering_options":null},"livemode":false,"metadata":{"profile":"6"},"name":"Fk","next_invoice_sequence":1,"phone":"3216603846","preferred_locales":[],"shipping":null,"tax_exempt":"none","test_clock":null},"updatedAt":"2023-12-21T09:32:44.000Z","createdAt":"2023-10-17T16:01:45.000Z","auth":26}}},"updatedAt":"2023-12-22T09:42:30.000Z","createdAt":"2023-12-22T09:42:05.000Z","user":26}}}
varItem {
  cartItem: {
    brand: 2,
    tax: 0,
    fee: 0,
    shippingMethod: {
      fee: 0,
      time: null,
      title: 'Standard Shipping',
      atFee: 7.598000000000001
    },
    paymentMethod: { name: 'stripe' },
    variations: [ [Object], [Object] ],
    orderDetailID: 381,
    brandName: 'Mango',
    address: {
      name: 'Fk',
      firstName: 'Mian',
      lastName: 'Ali',
      address: '680 Amboy Ave',
      city: 'Woodbridge',
      state: 'New Jersey',
      zip: '07095',
      phone: '17324051053'
    }
  },
  orderIDS: '210',
  scrapperName: 'mango_order_place',
  detailedIDs: [ 381 ],
  orderLimits: {
    id: 210,
    uuid: 'AT-2312229424-415',
    brands: [ 2 ],
    totalAmount: 8357,
    status: 'received',
    stripeStatus: 'charge.succeeded',
    orders: [ 381 ],
    details: [ [Object] ],
    cartDetails: { cart: [Array], address: [Object], user: [Object] },
    updatedAt: '2023-12-22T09:42:30.000Z',
    createdAt: '2023-12-22T09:42:05.000Z',
    user: 26
  }
}
varItem.scrapperName, varItem.orderIDS mango_order_place 210
 orderIDS 210
 scrapper mango_order_place
cartItem {
  brand: 2,
  tax: 0,
  fee: 0,
  shippingMethod: {
    fee: 0,
    time: null,
    title: 'Standard Shipping',
    atFee: 7.598000000000001
  },
  paymentMethod: { name: 'stripe' },
  variations: [
    {
      id: 8132,
      size: [Array],
      referalId: '5xvrtj9llq57svwv',
      quantity: '1',
      price: 49.99,
      status: 'active',
      link: 'https://shop.mango.com/us/men/jeans-skinny/jude-skinny-fit-jeans_57040734.html'
    },
    {
      id: 9356,
      size: [Array],
      quantity: '1',
      price: 25.99,
      status: 'active',
      link: 'https://shop.mango.com/us/teen/t-shirts-and-tops-long-sleeve/ribbed-long-sleeved-t-shirt_57004030.html?c=99'
    }
  ],
  orderDetailID: 381,
  brandName: 'Mango',
  address: {
    name: 'Fk',
    firstName: 'Mian',
    lastName: 'Ali',
    address: '680 Amboy Ave',
    city: 'Woodbridge',
    state: 'New Jersey',
    zip: '07095',
    phone: '17324051053'
  }
}
detailedIDs [ 381 ]
orderLimits {
  id: 210,
  uuid: 'AT-2312229424-415',
  brands: [ 2 ],
  totalAmount: 8357,
  status: 'received',
  stripeStatus: 'charge.succeeded',
  orders: [ 381 ],
  details: [ { brand: 2, variations: [Array] } ],
  cartDetails: {
    cart: [ [Object] ],
    address: {
      id: 34,
      city: 'Woodbridge',
      state: 'New Jersey',
      country: 'United States',
      address: '680 Amboy Ave',
      zipCode: '07095',
      firstName: 'Mian',
      lastName: 'Ali',
      phoneNumber: '17324051053',
      defaultAddress: true,
      updatedAt: '2023-12-20T10:18:03.000Z',
      createdAt: '2023-12-20T10:18:03.000Z',
      userProfile: 6
    },
    user: {
      id: 26,
      active: true,
      phoneNo: '3216603846',
      email: 'xotickhan1@gmail.com',
      otp: null,
      otpAt: null,
      bearerToken: '1qCZQOyuv6laRf-G01pFlWT9nZOHF8_WDARnn8XSb8XqWj2HJnd-RNNgznezbFTD4NycDBJ4isLfW89kzalAdQOmZn79NbqcoFH-0A6FuLqtfNk97-lFoULLkgPM-1Ydc5qdAQ45mUs1OZExnyDlT4AvbY_Aygk4PwLiTnkc7p4',
      bearerCreatedAt: '2023-12-21T09:34:36.000Z',
      updatedAt: '2023-12-21T09:34:36.000Z',
      createdAt: '2023-10-17T16:01:45.000Z',
      referralId: '5xvrtj9llq57svkr',
      profile: [Object]
    }
  },
  updatedAt: '2023-12-22T09:42:30.000Z',
  createdAt: '2023-12-22T09:42:05.000Z',
  user: 26
}
sails.config.globals.socket.id 9jCN73NG9oqvKdHLAAAd
sails.config.globals.socket.id 9jCN73NG9oqvKdHLAAAd
_sizes undefined
data recieved back : error orderscrapper
/var/www/Atricent/api/services/User.js:134
    if (resulted.error) {
                 ^

TypeError: Cannot read properties of undefined (reading 'error')
    at Socket.<anonymous> (/var/www/Atricent/api/services/User.js:134:18)
    at Emitter.emit (/var/www/Atricent/node_modules/@socket.io/component-emitter/index.js:143:20)
    at Socket.emitEvent (/var/www/Atricent/node_modules/socket.io-client/build/cjs/socket.js:519:20)
    at Socket.onevent (/var/www/Atricent/node_modules/socket.io-client/build/cjs/socket.js:506:18)
    at Socket.onpacket (/var/www/Atricent/node_modules/socket.io-client/build/cjs/socket.js:474:22)
    at Emitter.emit (/var/www/Atricent/node_modules/@socket.io/component-emitter/index.js:143:20)
    at /var/www/Atricent/node_modules/socket.io-client/build/cjs/manager.js:237:18
    at process.processTicksAndRejections (node:internal/process/task_queues:81:21)

Node.js v18.14.1
root@atricent:/var/www/Atricent#
 */

const appIO = { socket: null };
console.log('appIO.socket:', appIO.socket);
io.on('connection', socket => {
   console.log('connected:', socket.client.id);
   appIO.socket = socket;
   //  
   appIO.socket.on('orderScrapper', async function (data) {
      console.log('on orderScrapper data===========>', data)
      console.log('on orderScrapper data.scrapper==========>', data.scrapper)
      let tempScrapName = null;
      if (data.scrapper === 'h&m_order_place') {
         tempScrapName = 'hm_order_place'
      } else {
         tempScrapName = data.scrapper
      }
      const momentFileName = moment().format('HHmmssSS')
      const asyncTask = runOrderScrapper(data.cartItem, data.orderIDS, tempScrapName, momentFileName)
      try {
         const data = await asyncTask;
         console.log('Async task has completed', data);
         console.log('Async task has completed', data.stdout);
         const newData = data.stdout.trim()
         console.log('Trimmed output', newData);
         const order = await readOrderFile(newData)
         console.log('Before emitting order =>', order)
         tempOrder = order
         appIO.socket.emit('orderScrapper', tempOrder);

      } catch (error) {
         // commented due to error
         // appIO.socket.emit('testOne', "error");
         appIO.socket.emit('orderScrapper', "error orderscrapper");
         console.error('Async task encountered an error:', error);
      }
   });
   // 
   appIO.socket.on('sizeScrapper', async function (data) {
      console.log('======== real data recieved =======')
      /**
       * {
  link: {
    size: [ null, '28"', '12' ],
    id: 553,
    quantity: '1',
    link: 'https://shop.lululemon.com/p/womens-leggings/Align-HighRise-Crop-23-Pockets/_/prod10370068?color=29824',
    userId: 26
  }
}
       */
      console.log(data)
      console.log('======== real data recieved =======')

      // console.log('payload', payload)
      let cartSizes = [];
      let appResult = []
      let index = 0;
      const result = await sizeScrapper(data.link.link, data.link.userId, data.link.id)
      /**
       * result {
  parsedData: [
    { type: null, length: '25"', size_elements: [Array] },
    { type: null, length: '28"', size_elements: [Array] },
    { type: null, length: '31"', size_elements: [Array] }
  ],
  sizeUpdate: { data: [ [Object], [Object], [Object] ], id: 26 }
}

item==> {
  type: null,
  length: '25"',
  size_elements: '["0","2","4","6","8","10","12","14"]'
}
item==> { type: null, length: '28"', size_elements: '["2"]' }
item==> { type: null, length: '31"', size_elements: '["2"]' }
       */
      console.log('result', result)

      for (let item of result.sizeUpdate.data) {
         console.log('item==>', item)
      }


      if (result.parsedData) {
         const parsedSize = result.parsedData



         if (parsedSize.length) {
            let tempID = null
            const temp = parsedSize.map(ps => {
               if (tempID !== ps.id) {
                  tempID = ps.id
               }
               const sample = ps.size_elements ? JSON.stringify(ps.size_elements) : ps.size_elements
               return { ...ps, size_elements: sample }
            })
            // console.log('tempID before emitting ==>', tempID)
            // console.log('temp before emitting ==>', temp)
            // appResult.push({id:tempID, data: temp})
            console.log('{ data: temp, id: tempID }', { data: temp, id: tempID })
            // emiting stoped for size update
            // appIO.socket.emit('sizeUpdate', { data: temp, id: tempID })
            // await Size.update({ variation: returnedItem.id }).set({ meta: temp })
            // await deleteGeneratedFile(stdout)
            for (let i = 0; i < parsedSize.length; i++) {
               parsedSize[i]["item"] = data.link;
               parsedSize[i]["id"] = data.link.id;
            }
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

                     // console.log('item.item.size 1=======>', JSON.stringify(item.item.size))
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
         console.log('in else result', result.parsedData)
         const temp = {}
         temp.response = result.parsedData
         temp.id = varItem.id
         cartSizes.push(temp)
         // appIO.socket.emit('sizeScrapper', [temp]);
      }


      pusher.trigger("my-channel", "my-event", {
         message: { cartSizes: cartSizes, userId: data.link.userId }
      });
      console.log(`emitted ============= `, { cartSizes: cartSizes, userId: data.link.userId });
      //sails.config.globals.appSocket.emit('sizeScrapperApp', { cartSizes: cartSizes, userId: data.link.id });
      appIO.socket.emit('sizeScrapperApp', { cartSizes: cartSizes, userId: data.link.userId });
      cartSizes = [];
   })


   // appIO.socket.on('sizeScrapper', async function (data) {

   //    let cartSizes = [];
   //    let appResult = []
   //    let index = 0;
   //    for await (const cartItem of data.carts) {
   //       let count = 0;
   //       for (const varItem of cartItem.variations) {
   //          let num = 0;
   //          if (varItem?.link?.link) {

   //             const result = await sizeScrapper(varItem.link.link, io, varItem.id, num, count, index)
   //             if (result) {
   //                for (let item of result) {
   //                   item.item = varItem
   //                   item.id = varItem.id
   //                }

   //                console.log('result', result)
   //                const parsedSize = result
   //                if (parsedSize.length) {
   //                   let tempID = null
   //                   const temp = parsedSize.map(ps => {
   //                      if (tempID !== ps.id) {
   //                         tempID = ps.id
   //                      }
   //                      const sample = ps.size_elements ? JSON.stringify(ps.size_elements) : ps.size_elements
   //                      return { ...ps, size_elements: sample }
   //                   })
   //                   console.log('tempID before emitting ==>', tempID)
   //                   console.log('temp before emitting ==>', temp)
   //                   // appResult.push({id:tempID, data: temp})

   //                   // appIO.socket.emit('sizeUpdate', {data: temp, id: tempID})
   //                   // await Size.update({ variation: returnedItem.id }).set({ meta: temp })
   //                   // await deleteGeneratedFile(stdout)

   //                   const firstMatch = parsedSize.filter(size => {

   //                      const tempType = size.type !== null ? size.type.toLowerCase() : size.type
   //                      const tempLength = size.length !== null ? size.length.toLowerCase() : size.length

   //                      const givenType = size.item.size[0] !== null ? size.item.size[0].toLowerCase() : size.item.size[0]
   //                      const givenLength = size.item.size[1] !== null ? size.item.size[1].toLowerCase() : size.item.size[1]

   //                      return tempType === givenType && tempLength === givenLength
   //                   })

   //                   if (firstMatch.length) {
   //                      for (let item of firstMatch) {
   //                         if (item.size_elements !== null) {

   //                            console.log('item.item.size 1=======>', JSON.stringify(item.item.size))
   //                            const ele = item.size_elements.findIndex(sizeItem => sizeItem.toLowerCase() == item.item.size[2].toLowerCase())
   //                            console.log('ele', ele)
   //                            if (ele === -1) {
   //                               const sizesReturned = {
   //                                  id: item.item.id,
   //                                  error: 'Size not available, wanna checkout other sizes'
   //                               }
   //                               cartSizes.push(sizesReturned)
   //                            }
   //                         } else {
   //                            const sizesReturned = {
   //                               id: item.item.id,
   //                               error: 'All sizes are out of stock'
   //                            }
   //                            cartSizes.push(sizesReturned)
   //                         }
   //                      }
   //                   } else {
   //                      let id = 0
   //                      for (let temp of parsedSize) {
   //                         id = temp.id
   //                         break
   //                      }
   //                      const sizesReturned = {
   //                         id: id,
   //                         error: 'No size available'
   //                      }
   //                      cartSizes.push(sizesReturned)
   //                   }

   //                } else {
   //                   console.log('no data returned from the scrapper')
   //                }
   //                // appIO.socket.emit('sizeScrapper', result);
   //             } else {
   //                console.log('in else result', result)
   //                const temp = {}
   //                temp.response = result
   //                temp.id = varItem.id
   //                // appIO.socket.emit('sizeScrapper', [temp]);
   //             }
   //          } else {
   //             console.log('in else result', result)
   //             const temp = {}
   //             temp.response = "Variation does not have link"
   //             temp.id = varItem.id
   //             cartSizes.push(temp)
   //          }
   //          num++
   //       }
   //       count++
   //    }


   //    // ---------------------------------- jugad






   //    // }


   //    console.log('cartSizes before emiting event-->', cartSizes)

   //    // for (let cartItem of cartSizes) {
   //    //    appResult[cartItem.id] = cartItem.error
   //    // }
   //    // console.log('appResult before emiting event-->', appResult)

   //    // appIO.socket.emit('sizeUpdate', appResult)
   //    appIO.socket.emit('sizeScrapperApp', cartSizes);
   //    // sails.config.globals.appSocket.emit('sizeScrapperApp', { cartSizes });
   //    cartSizes = [];
   //    // appResult = [];






   // })
});
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
app.post('/test', async (req, res) => {
   const data = JSON.parse(req.body.toString())
   console.log('data', data)
   try {

      // const result = await deleteGeneratedFile(data.path)
      res.json(result);
   } catch (error) {
      console.log(error)
   }
})
app.post('/size-scrapper', async (req, res) => {
   const data = req.body
   // console.log('data', JSON.parse(data.toString()))
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
app.post('/queue/order-scrapper', async (req, res) => {
   const rawBody = req.body.toString('utf-8');
   const payload = JSON.parse(rawBody);
   // const data = payload
   console.log('payload', payload)
   // console.log('data', data)
   try {

      /**
       * Trimmed output ,order_20231227_123725.json
      Async task encountered an error: [Error: EISDIR: illegal operation on a directory, read] {
        errno: -21,
        code: 'EISDIR',
        syscall: 'read'
      }
       */

      // appIO.socket.on('orderScrapper', async function (data) {
      const momentFileName = moment().format('HHmmssSS')
      const asyncTask = runOrderScrapper(payload.cartItem, payload.scrapper, momentFileName)
      // try {
      const data = await asyncTask;
      console.log('Async task has completed', data);
      console.log('Async task has completed', data.stdout);
      const newData = data.stdout.trim()
      console.log('Trimmed output', newData);
      const order = await readOrderFile(newData, io)
      console.log('Before emitting order =>', order)
      tempOrder = order
      console.log('tempOrder', tempOrder)
      // sent this to new queue
      // commented implemented the queue
      // appIO.socket.emit('orderScrapper', tempOrder);
      ch.sendToQueue('orderScrapperQueue', Buffer.from(JSON.stringify({ tempOrder })));

      // } catch (error) {
      //    // appIO.socket.emit('testOne', "error");
      //    // appIO.socket.emit('orderScrapper', "error orderscrapper");
      //    console.error('Async task encountered an error:', error);
      //    return res.status(200).json({
      //       message: 'success'
      //    });
      // }
      // });





      // const result = await orderScrapper(data.cartItem, data.scrapper, appIO)
      // console.log('result', result)
      // res.json(result);
      return res.status(200).json({
         message: 'success'
      });
   } catch (error) {
      console.log(error)
      // return res.status(200).json({
      //    message: 'success'
      // });
      return res.status(423).json({
         message: 'failure'
      })
   }
})
app.post('/queue/size-scrapper', async (req, res) => {

   var fs = require('fs');

   try {
      const rawBody = req.body.toString('utf-8');
      const payload = JSON.parse(rawBody);
      const data = payload;
      let cartSizes = [];
      let appResult = []
      let index = 0;
      for await (const cartItem of payload.carts) {
         let count = 0;
         for (const varItem of cartItem.variations) {
            let num = 0;
            if (varItem?.link?.link) {

               const result = await sizeScrapper(varItem.link.link, io, varItem.id, num, count, index)
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
                     // console.log('tempID before emitting ==>', tempID)
                     // console.log('temp before emitting ==>', temp)
                     // appResult.push({id:tempID, data: temp})

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

                              // console.log('item.item.size 1=======>', JSON.stringify(item.item.size))
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
            num++
         }
         count++
      }


      // ---------------------------------- jugad






      // }


      console.log('cartSizes before emiting event-->')

      // for (let cartItem of cartSizes) {
      //    appResult[cartItem.id] = cartItem.error
      // }
      // console.log('appResult before emiting event-->', appResult)

      // appIO.socket.emit('sizeUpdate', appResult)
      // io.on('connection', socket => {
      // console.log('client id  ====== ',socket.client.id);
      // console.log(`emittedinnnn ============= `, {cartSizes: cartSizes, userId: payload.userId});
      //    socket.emit('sizeScrapperApp', {cartSizes: cartSizes, userId: payload.userId});
      // })
      appIO.socket.emit('sizeScrapperApp', { cartSizes: cartSizes, userId: payload.userId });
      pusher.trigger("my-channel", "my-event", {
         message: { cartSizes: cartSizes, userId: payload.userId }
      });
      console.log(`emitted ============= `, { cartSizes: cartSizes, userId: payload.userId });
      // sails.config.globals.appSocket.emit('sizeScrapperApp', { cartSizes });
      cartSizes = [];
      return res.status(200).json({
         message: 'success'
      });
   } catch (error) {
      console.log(error);
      // return res.status(200)
      return res.status(423).json({
         message: 'failure'
      })
   }
})

app.post('/bull/size-scrapper', async (req, res) => {

   // var fs = require('fs');
   console.log('first')
   try {
      const rawBody = req.body.toString('utf-8');
      console.log('rawBody', rawBody)
      const payload = JSON.parse(rawBody)
      /**
       * payload {
  size: [ null, null, 'M' ],
  id: 67916,
  quantity: '1',
  link: 'https://www.forever21.com/us/2000470885.html?dwvar_2000470885_color=01',
  userId: 26
}


file size20231208_091207.json
readFile data:  [ { type: null, length: null, size_elements: null } ]
TypeError: result is not iterable
    at /var/www/atricent-automation/server.js:500:27

result {
  parsedData: [ { type: null, length: null, size_elements: null } ],
  sizeUpdate: { data: [ [Object] ], id: 26 }
}

       */
      console.log('payload', payload)
      let cartSizes = [];
      let appResult = []
      let index = 0;


      const result = await sizeScrapper(payload.link, payload.userId)
      console.log('result', result)
      if (result.parsedData) {
         for (let item of result.parsedData) {
            item.item = payload
            item.id = payload.id
         }


         const parsedSize = result.parsedData
         if (parsedSize.length) {
            let tempID = null
            const temp = parsedSize.map(ps => {
               if (tempID !== ps.id) {
                  tempID = ps.id
               }
               const sample = ps.size_elements ? JSON.stringify(ps.size_elements) : ps.size_elements
               return { ...ps, size_elements: sample }
            })
            // console.log('tempID before emitting ==>', tempID)
            // console.log('temp before emitting ==>', temp)
            // appResult.push({id:tempID, data: temp})

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

                     // console.log('item.item.size 1=======>', JSON.stringify(item.item.size))
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
         console.log('in else result', result.parsedData)
         const temp = {}
         temp.response = result.parsedData
         temp.id = varItem.id
         // appIO.socket.emit('sizeScrapper', [temp]);
      }


      pusher.trigger("my-channel", "my-event", {
         message: { cartSizes: cartSizes, userId: payload.userId }
      });
      console.log(`emitted ============= `, { cartSizes: cartSizes, userId: payload.userId });
      // sails.config.globals.appSocket.emit('sizeScrapperApp', { cartSizes });
      cartSizes = [];
      return res.status(200).json({ cartSizes: cartSizes, userId: payload.userId });
   } catch (error) {
      console.log(error);
      // return res.status(200)
      return res.status(423).json({
         message: 'failure'
      })
   }
})

var server = app.listen(8988, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("atricent scrapper listening at http://%s:%s", host, port)
})




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