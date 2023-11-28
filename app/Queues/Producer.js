exports.producer = async (job) => {
    const Bull = require('bull')
    const cartQueue = new Bull('cart-queue', 'redis://127.0.0.1:6379')
    cartQueue.add({job})
    return cartQueue
}