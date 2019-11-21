module.exports = {
    fields: ['price', 'amount', 'asset'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.integer(tx.data.price, false, false)) {
            cb(false, 'invalid tx data.price'); return
        }
        if (!validate.integer(tx.data.amount, false, false)) {
            cb(false, 'invalid tx data.amount'); return
        }
        if (!validate.string(tx.data.asset, config.assetMaxLength, config.assetMinLength, config.assetAlphabet, '')) {
            cb(false, 'invalid tx data.asset'); return
        }
        cache.findOne('accounts', { name: tx.sender }, function (err, account) {
            if (err) throw err
            if (account.balance < (tx.data.amount * tx.data.price)) {
                cb(false, 'invalid tx not enough balance'); return
            }
            else cb(true)
        })
    },
    execute: (tx, ts, cb) => {
        // remove funds from sender
        cache.updateOne('accounts',
            { name: tx.sender },
            { $inc: { balance: - (tx.data.amount * tx.data.price) } },
            function () {
                // check sell order in market
                cache.find('market', {asset: tx.data.asset, type:"buy"}, function(err, orders) {
                    console.log(orders)

                })

                // add order to buy market
                db.collection('market').insertOne(
                    { name: tx.sender, amount: tx.data.amount, price: tx.data.price, type: "sell", asset: tx.data.asset },
                    function () {
                        cb(true)
                    }
                )
            })
    }
}