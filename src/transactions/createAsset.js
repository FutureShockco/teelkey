module.exports = {
    fields: ['name', 'ticker', 'supply', 'precision'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.name, config.nftMaxLength, config.nftMinLength, config.assetNameAlphabet, '')) {
            cb(false, 'invalid tx data.name'); return
        }
        if (!validate.string(tx.data.ticker, config.assetMaxLength, config.assetMinLength, config.assetSymbolAlphabet, '')) {
            cb(false, 'invalid tx data.ticker'); return
        }
        if (!validate.integer(tx.data.supply, false, false)) {
            cb(false, 'invalid tx data.supply'); return
        }
        if (!validate.integer(tx.data.precision, true, false, config.assetMaxPrecision)) {
            cb(false, 'invalid tx data.precision'); return
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