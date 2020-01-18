module.exports = {
    fields: ['number'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.integer(tx.data.number, false, false)) {
            cb(false, 'invalid tx data.supply'); return
        }
        cache.findOne('assets', { name: tx.data.name }, function (err, asset) {
            if (err) throw err
            if (asset && asset.name === tx.data.name) {
                cb(false, 'invalid tx ' + tx.data.name + ' already exist'); return
            }
            else cache.findOne('assets', { symbol: tx.data.ticker }, function (err, asset) {
                if (err) throw err
                if (asset && asset.symbol === tx.data.ticker) {
                    cb(false, 'invalid tx ' + tx.data.ticker + ' already exist'); return
                }
                cache.findOne('accounts', { name: tx.sender }, function (err, account) {
                    if (err) throw err
                    if (account.balance < config.assetCreationFee) {
                        cb(false, 'invalid tx not enough balance'); return
                    }
                    else cb(true)
                })
            })
        })
    },
    execute: (tx, ts, cb) => {
        cache.updateOne('accounts',
            { name: tx.sender },
            { $inc: { balance: - config.assetCreationFee } },
            function () {
                var newAsset = { name: tx.data.name, symbol: tx.data.ticker, supply: tx.data.supply, issued: 0, precision: tx.data.precision, created: ts, issuer: tx.sender }
                cache.insertOne('assets', newAsset, function () {
                    cb(true)
                })
            })
    }
}