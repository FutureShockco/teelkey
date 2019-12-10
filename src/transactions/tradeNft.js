module.exports = {
    fields: ['id', 'ask'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.id, config.nftMaxLength, config.nftMinLength, config.nftAlphabet, '')) {
            cb(false, 'invalid tx data.id'); return
        }
        if (!validate.string(tx.data.ask, config.nftMaxLength, config.nftMinLength, config.nftAlphabet, '')) {
            cb(false, 'invalid tx data.ask'); return
        }
        cache.findOne('accounts', { name: tx.sender }, function (err, account) {
            if (err) throw err
            if (!account || !account.nfts || !account.nfts.includes(tx.data.id)) {
                cb(false, 'invalid tx can not find ' + tx.data.id + ' in your wallet'); return
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
                var newOrder = { name: tx.sender, nft: tx.data.id, ask: tx.data.min_price, type: "trade", created: ts }
                cache.insertOne('nft_market', newOrder, function () {
                    cb(true)
                });
            })
    }
}