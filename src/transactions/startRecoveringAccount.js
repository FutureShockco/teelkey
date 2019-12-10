module.exports = {
    fields: ['name'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.name, config.accountMaxLength, config.accountMinLength, config.allowedUsernameChars, config.allowedUsernameCharsOnlyMiddle)) {
            cb(false, 'invalid tx data.name'); return
        }
        if (!validate.publicKey(tx.data.pub, config.accountMaxLength)) {
            cb(false, 'invalid tx data.pub'); return
        }
        cache.findOne('accounts', { name: tx.data.name }, function (err, account) {
            if (err) throw err
            if (tx.data.name !== tx.sender) {
                cb(false, 'invalid tx you are not the account owner'); return
            }
            else cb(true)
        })
    },
    execute: (tx, ts, cb) => {
        cache.updateOne('accounts', {name: tx.data.name}, {$set: {recovering: true}}, function() {
            cb(true)
        })
    }
}