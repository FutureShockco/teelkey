module.exports = {
    fields: ['receiver', 'amount', 'asset', 'memo'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.receiver, config.accountMaxLength, config.accountMinLength, config.allowedUsernameChars, config.allowedUsernameCharsOnlyMiddle)) {
            cb(false, 'invalid tx data.receiver'); return
        }
        if (!validate.integer(tx.data.amount, false, false)) {
            cb(false, 'invalid tx data.amount'); return
        }
        if (!validate.string(tx.data.memo, config.memoMaxLength)) {
            cb(false, 'invalid tx data.memo'); return
        }
        if (!validate.string(tx.data.asset, config.assetMaxLength, config.assetMinLength, config.assetSymbolAlphabet, '')) {
            cb(false, 'invalid tx data.asset'); return
        }
        cache.findOne('assets', { symbol: tx.data.asset, issuer: tx.sender }, function (err, asset) {
            if (err) throw err
            if (!asset || (asset.issued + tx.data.amount) > asset.supply) {
                cb(false, 'invalid tx can not issue ' + tx.data.asset + ' '); return
            }
            else cb(true)
        })

    },
    execute: (tx, ts, cb) => {
        // add funds to receiver
        cache.findOne('accounts', { name: tx.data.receiver }, function (err, account) {
            var assets = account.assets || {};
            if (assets[tx.data.asset]) assets[tx.data.asset] += tx.data.amount
            else assets[tx.data.asset] = tx.data.amount
            cache.updateOne('accounts',
                { name: tx.data.receiver },
                { $set: { assets: assets } },
                function () {
                    // remove funds from sender
                    cache.findOne('assets', { symbol: tx.data.asset, issuer: tx.sender }, function (err, asset) {
                        asset.issued += tx.data.amount
                        cache.updateOne('assets',
                            { _id: asset._id },
                            { $set: asset },
                            function () {
                                cb(true)
                            }
                        )
                    })
                })
        })
    }
}