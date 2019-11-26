module.exports = {
    fields: ['user'],
    validate: (tx, ts, legitUser, cb) => {
        cache.findOne('accounts', { name: tx.data.user }, function (err, account) {
            if (err) throw err
            if (!account) {
                cb(false, 'invalid tx recovery account does not exist'); return
            }
            else cb(true)
        })
    },
    execute: (tx, ts, cb) => {
        cache.updateOne('accounts', {name: tx.sender}, {$set: {recovery: tx.data.user}}, function() {
            cb(true)
        })
    }
}