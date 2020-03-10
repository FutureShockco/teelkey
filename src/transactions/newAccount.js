module.exports = {
    fields: ['name', 'pub'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.name, config.accountMaxLength, config.accountMinLength, config.allowedUsernameChars, config.allowedUsernameCharsOnlyMiddle)) {
            cb(false, 'invalid tx data.name'); return
        }
        if (!validate.publicKey(tx.data.pub, config.accountMaxLength)) {
            cb(false, 'invalid tx data.pub'); return
        }
        if (tx.data.json && !validate.json(tx.data.json, config.jsonMaxBytes)) {
            cb(false, 'invalid tx data.json'); return
        }
        var lowerUser = tx.data.name.toLowerCase()

        for (let i = 0; i < lowerUser.length; i++) {
            const c = lowerUser[i]
            // allowed username chars
            if (config.allowedUsernameChars.indexOf(c) === -1) 
                if (config.allowedUsernameCharsOnlyMiddle.indexOf(c) === -1) {
                    cb(false, 'invalid tx data.name char '+c); return
                } else if (i === 0 || i === lowerUser.length-1) {
                    cb(false, 'invalid tx data.name char '+c+' can only be in the middle'); return
                }
            
        }

        cache.findOne('accounts', {name: lowerUser}, function(err, account) {
            if (err) throw err
            if (account)
                cb(false, 'invalid tx data.name already exists')
            else if (tx.data.name !== tx.data.pub) 
                // if it's not a free account, check tx sender balance
                cache.findOne('accounts', {name: tx.sender}, function(err, account) {
                    if (err) throw err
                    if (account.balance < eco.accountPrice(lowerUser))
                        cb(false, 'invalid tx not enough balance')
                    else
                        cb(true)
                })
            else cb(true)
        })
    },
    execute: (tx, ts, cb) => {
        // set new account configuration
        cache.insertOne('accounts', {
            name: tx.data.name.toLowerCase(),
            created:ts,
            pub: tx.data.pub,
            balance: 0,
            bw: {v:0,t:0},
            vt: {v:0,t:0},
            pr: {v:0,t:0},
            uv: 0,
            follows: [],
            followers: [],
            keys: [],
            recovery: config.masterName,
            recovering : false,
            json:tx.data.json || {}
        }, function(){
            if (tx.data.name !== tx.data.pub.toLowerCase()) 
                if (tx.sender !== config.masterName || config.masterPaysForUsernames) {
                    //update sender account balance
                    cache.updateOne('accounts', 
                        {name: tx.sender},
                        {$inc: {balance: -eco.accountPrice(tx.data.name)}}, function() {
                            cache.findOne('accounts', {name: tx.sender}, function(err, acc) {
                                if (err) throw err
                                // update his bandwidth
                                acc.balance += eco.accountPrice(tx.data.name)
                                transaction.updateGrowInts(acc, ts, function() {
                                    transaction.adjustNodeAppr(acc, -eco.accountPrice(tx.data.name), function() {
                                        cb(true, null, eco.accountPrice(tx.data.name))
                                    })
                                })
                            })
                        })
                } else cb(true)
            else cb(true)
        })
    }
}