module.exports = {
    fields: ['id', 'price'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.id, config.nftMaxLength, config.nftMinLength, config.nftAlphabet, '')) {
            cb(false, 'invalid tx data.id'); return
        }
        if (!validate.integer(tx.data.price, false, false)) {
            cb(false, 'invalid tx data.price'); return
        }
        cache.findOne('accounts', { name: tx.sender }, function (err, account) {
            if (err) throw err
            if (account.balance < tx.data.price) {
                cb(false, 'invalid tx not enough balance'); return
            }
            cache.findOne('nft_market', { nft: tx.data.id }, function (err, nft) {
                if (err) throw err
                if (!nft) {
                    cb(false, 'invalid tx nft is not in sale'); return
                }
                else cb(true)
            })
        })
    },
    execute: (tx, ts, cb) => {
        // check sell order in market
        cache.findOne('nft_market', { nft: tx.data.id }, function (err, order) {
            let nft = order;
            //check if the nft price is higher and so start to bid
            if (nft.price > tx.data.price) {
                //check is the user has existent bids
                if (nft.bids && nft.bids.length > 0 && nft.bids.filter(bid => bid.name === tx.sender).length > 0) {
                    nft.bids.filter(bid => bid.name === tx.sender)[0].price += tx.data.price;
                    //if the bid doesnt reach the stop price we decrease the user balance and increase the bid
                    if (nft.price > nft.bids.filter(bid => bid.name === tx.sender)[0].price) {
                        cache.updateOne('nft_market',
                            { _id: order._id },
                            { $set: { bids: nft.bids } },
                            function () {
                                cb(true)
                            })
                    }
                    else {
                        //todo buy the nft and refund all bids

                        //remove the nft from the market and add it to user
                        cache.deleteOne('nft_market', order, function () {
                            cache.updateOne('accounts',
                                { name: tx.sender },
                                { $push: { nfts: tx.data.id } },
                                function () {
                                    cb(true)
                                })
                        });
                    }

                }
                else {
                    //user start a new bid under the stop price
                    let newOrder = { name: tx.sender, price: tx.data.price, created: ts }
                    nft.bids.push(newOrder)
                    cache.updateOne('nft_market',
                        { _id: order._id },
                        { $set: { bids: nft.bids } },
                        function () {
                            cb(true)
                        })
                }
            }
            //buy instantly the nft and resolve bids
            else {
                //todo refund all bids

                //remove the nft from the market and add it to user
                cache.deleteOne('nft_market', order, function () {
                    cache.updateOne('accounts',
                        { name: tx.sender },
                        { $push: { nfts: tx.data.id } },
                        function () {
                            cb(true)
                        })
                });
            }
        })
    }
}