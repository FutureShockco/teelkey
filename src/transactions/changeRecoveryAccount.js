module.exports = {
    fields: ['user'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.publicKey(tx.data.pub, config.accountMaxLength)) {
            cb(false, 'invalid tx data.pub'); return
        }
        cb(true)
    },
    execute: (tx, ts, cb) => {
        cache.updateOne('accounts', {name: tx.sender}, {$set: {recovery_account: tx.data.user}}, function() {
            cb(true)
        })
    }
}