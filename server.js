var express = require('express');
var app = express();
require('dotenv').config();

const cors = require('cors')
const {sizeScrapper, orderScrapper} = require('./scrapper')
// const corsOptions = {
//    origin: *
//    // origin: '165.232.147.215'
// }
// app.use(cors(corsOptions))
app.use(express.json())
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

