module.exports = {
    fields: ['id', 'min_price', 'price'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.id, config.nftMaxLength, config.nftMinLength, config.nftAlphabet, '')) {
            cb(false, 'invalid tx data.id'); return
        }
        if (!validate.integer(tx.data.min_price, false, false)) {
            cb(false, 'invalid tx data.min_price'); return
        }
        if (!validate.integer(tx.data.price, false, false)) {
            cb(false, 'invalid tx data.price'); return
        }
        cache.findOne('accounts', { name: tx.sender }, function (err, account) {
            if (err) throw err
            if (!account.nfts.includes(tx.data.id)) {
                cb(false, 'invalid tx not enough ' + tx.data.id + ' balance'); return
            }
            else cb(true)
        })
    },
    execute: (tx, ts, cb) => {
        // remove nft from sender
        cache.updateOne('accounts',
            { name: tx.sender },
            { $pull: { nfts: tx.data.id } },
            function () {
                //add asset to seller
                var newOrder = { name: tx.sender, nft: tx.data.id, min_price: tx.data.min_price, price: tx.data.price, type: "sell", created: ts, bids:[] }
                cache.insertOne('nft_market', newOrder, function () {
                    cb(true)
                });
            })
    }
}