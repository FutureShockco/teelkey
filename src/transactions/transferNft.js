module.exports = {
    fields: ['receiver', 'id', 'memo'],
    validate: (tx, ts, legitUser, cb) => {
        if (!validate.string(tx.data.receiver, config.accountMaxLength, config.accountMinLength, config.allowedUsernameChars, config.allowedUsernameCharsOnlyMiddle)) {
            cb(false, 'invalid tx data.receiver'); return
        }
        if (!validate.string(tx.data.memo, config.memoMaxLength)) {
            cb(false, 'invalid tx data.memo'); return
        }
        if (!validate.string(tx.data.id, config.nftMaxLength, config.nftMinLength, config.nftAlphabet, '')) {
            cb(false, 'invalid tx data.id'); return
        }
        if (tx.data.receiver === tx.sender) {
            cb(false, 'invalid tx cannot send to self'); return
        }

        // master mints tokens
        if (tx.sender === config.masterName) {
            cb(true)
            return
        }

        cache.findOne('accounts', {name: tx.sender}, function(err, account) {
            if (err) throw err
            if (!account.nft.includes(tx.data.id)) {
                cb(false, 'invalid tx not enough '+tx.data.id+' balance'); return
            }
            cache.findOne('accounts', {name: tx.data.receiver}, function(err, account) {
                if (err) throw err
                if (!account) cb(false, 'invalid tx receiver does not exist')
                else cb(true)
            })
        })
    },
    execute: (tx, ts, cb) => {
        // add unique to receiver
        cache.updateOne('accounts', 
            {name: tx.data.receiver},
            {$push: {nft: tx.data.id}},
            function() {
                if (tx.sender === config.masterName) {
                    cb(true)
                    return
                }
                
                // remove unique from sender
                cache.updateOne('accounts', 
                    {name: tx.sender},
                    {$pull: {nft: tx.data.id}},
                    function() {
                        cb(true)
                    }
                )
            })
        
    }
}