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
            if (!account.assets[tx.data.asset] || account.assets[tx.data.asset] < (tx.data.amount)) {
                cb(false, 'invalid tx not enough asset'); return
            }
            else cb(true)
        })
    },
    execute: (tx, ts, cb) => {
        // check buy order in market*
        let amount = tx.data.amount;
        let query = { $and: [{ amount: { $gte: 1 } }, { price: { $gte: tx.data.price } }, { asset: tx.data.asset, type: "buy" }]}
        let sort = { price: -1, created:1 }
        cache.find('market', query , sort , function (err, orders) {
            for(let i=0; i < orders.length && amount > 0; i++){
                let order = orders[i];
                //process the deal if existent order amount is bigger
                if (order.amount > amount) {
                    order.amount -= amount;
                    //increase buyer balance
                    cache.updateOne('accounts',
                        { name: tx.sender },
                        { $inc: { balance: + (amount * order.price) } },
                        function () {
                            //add asset to seller
                            cache.findOne('accounts', { name: order.name }, function (err, account) {
                                var assets = account.assets || {};
                                if (assets[tx.data.asset]) assets[tx.data.asset] += amount
                                else assets[tx.data.asset] = amount
                                cache.updateOne('accounts',
                                    { name: order.name },
                                    { $set: { assets: assets } },
                                    function () {
                                        amount = 0;
                                        //check if the order should be removed or still have amount left in and return
                                        if (order.amount > 0) cache.updateOne('market',{ _id: order._id }, { $set: order }, function(){});
                                        else  cache.deleteOne('market',order, function(){});
                                        return
                                    })
                            })
                        })
                }
                //process the deal if existent order amount is smaller
                else {
                    //add tokens to seller
                    cache.updateOne('accounts',
                        { name: tx.sender },
                        { $inc: { balance: + (order.amount * order.price) } },
                        function () {
                            //add assets to buyer
                            cache.findOne('accounts', { name: order.name }, function (err, account) {
                                var assets = account.assets || {};
                                if (assets[tx.data.asset]) assets[tx.data.asset] += order.amount
                                else assets[tx.data.asset] = order.amount
                                cache.updateOne('accounts',
                                    { name: order.name },
                                    { $set: { assets: assets } },
                                    function () {
                                        //remove the order
                                        amount -= order.amount;
                                        cache.deleteOne('market',order, function(){});
                                    })
                            })
                        })
                }
            }
            //if no order or couldnt spend all let open a new order
            if (amount > 0) {
                var newOrder = { name: tx.sender, amount: amount, price: tx.data.price, type: "sell", asset: tx.data.asset, created: ts }
                cache.insertOne('market',newOrder,function () {
                        cache.findOne('accounts', { name: tx.sender }, function (err, account) {
                            var assets = account.assets || {};
                            assets[tx.data.asset] -= amount
                            cache.updateOne('accounts',
                                { name: tx.sender },
                                { $set: { assets: assets } },
                                function () {
                                    cb(true)
                                })
                        })
                    }
                )
            }
            else cb(true)
        })

    }
}