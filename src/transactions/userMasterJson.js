module.exports = {
    fields: ['json'],
    validate: (tx, ts, legitUser, cb) => {
        // handle arbitrary json input
        if (tx.sender !== config.masterName) {
            cb(false, 'limited to master account'); return
        }
        if (!validate.json(tx.data.json, config.jsonMaxBytes)) {
            cb(false, 'invalid tx data.json'); return
        }
        cb(true)
    },
    execute: (tx, ts, cb) => {
        cache.updateOne('accounts', {
            name: tx.sender
        },{ $set: {
            mjson: tx.data.json
        }}, function(){
            cb(true)
        })
    }
}