const { sizeScrapper } = require("../scrapper");
const sizeScrapperQueue = require("./sizeScrapperQueue");

exports.processSize = async (data) => {
    let cartSizes = [];
    let appResult = []
    let index = 0;
    for await (const cartItem of data.carts) {
        let count = 0;
        for (const varItem of cartItem.variations) {
            let num = 0;
            if (varItem?.link?.link) {

                // Enqueue the sizeScrapper job
                const job = await sizeScrapperQueue.add({
                    link: varItem.link.link,
                    io,
                    id: varItem.id,
                    num,
                    count,
                    index,
                });

                // const result = await sizeScrapper(varItem.link.link, io, varItem.id, num, count, index)
                job.on('completed', (result) => {
                    console.log(`Job ${job.id} completed. Result:`, result);
                    // Handle the result based on your existing logic
                    if (result) {
                        // Your existing result handling logic...
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
                        // Handle the case where result is falsy (e.g., an error occurred)
                    }
                });
                // Listen for the failed event
                job.on(`failed:${job.id}`, (error) => {
                    console.error(`Job ${job.id} failed. Error:`, error);
                    // Handle the error as needed
                });


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
    return cartSizes;
}