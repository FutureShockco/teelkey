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
            if (account.balance < (tx.data.amount * tx.data.price)) {
                cb(false, 'invalid tx not enough balance'); return
            }
            else cb(true)
        })
    },
    execute: (tx, ts, cb) => {
        // check sell order in market
        db.collection('market').find({ $and: [{ amount: { $gte: 1 } }, { price: { $lte: tx.data.price } }, { asset: tx.data.asset, type: "sell" }] }, { sort: { price: 1 } }).toArray(function (err, orders) {
            for (let index = 0; index < orders.length && tx.data.amount > 0; index++) {
                let order = orders[index];
                //process the deal if existent order amount is bigger
                if (order.amount >= tx.data.amount) {
                    order.amount -= tx.data.amount;
                    //increase seller balance
                    cache.updateOne('accounts',
                        { name: order.name },
                        { $inc: { balance: + (tx.data.amount * order.price) } },
                        function () {
                            cache.updateOne('accounts',
                                { name: tx.sender },
                                { $inc: { balance: - (tx.data.amount * order.price) } },
                                function () {
                                    //add asset to buyer
                                    cache.findOne('accounts', { name: tx.sender }, function (err, account) {
                                        var assets = account.assets || {};
                                        if (assets[tx.data.asset]) assets[tx.data.asset] += tx.data.amount
                                        else assets[tx.data.asset] = tx.data.amount
                                        cache.updateOne('accounts',
                                            { name: tx.sender },
                                            { $set: { assets: assets } },
                                            function () {
                                                tx.data.amount = 0;
                                                //check if the order should be removed or still have amount left in and return
                                                if (order.amount > 0) db.collection('market').updateOne({ "_id": order._id }, { $set: order }, { upsert: true });
                                                else db.collection('market').deleteOne({ "_id": order._id });
                                                return
                                            })
                                    })
                                })

                        })
                }
                else {
                    //increase seller balance
                    cache.updateOne('accounts',
                        { name: order.name },
                        { $inc: { balance: + (tx.data.amount * tx.data.price) } },
                        function () {
                            cache.updateOne('accounts',
                                { name: tx.sender },
                                { $inc: { balance: - (tx.data.amount * order.price) } },
                                function () {
                                    //add asset to buyer
                                    cache.findOne('accounts', { name: tx.sender }, function (err, account) {
                                        var assets = account.assets || {};
                                        if (assets[tx.data.asset]) assets[tx.data.asset] += tx.data.amount
                                        else assets[tx.data.asset] = tx.data.amount
                                        cache.updateOne('accounts',
                                            { name: tx.sender },
                                            { $set: { assets: assets } },
                                            function () {
                                                //remove the order
                                                tx.data.amount -= order.amount;
                                                db.collection('market').deleteOne({ "_id": order._id });
                                            })
                                    })
                                })
                        })
                }
            }
            if (tx.data.amount > 0) {
                db.collection('market').insertOne(
                    { name: tx.sender, amount: tx.data.amount, price: tx.data.price, type: "buy", asset: tx.data.asset, expire: ts + (7 * 24 * 60 * 60 * 1000) },
                    function () {
                        cache.updateOne('accounts',
                        { name: tx.sender },
                        { $inc: { balance: - (tx.data.amount * tx.data.price) } },
                        function () {
                            cb(true)
                        })
                    }
                )
            }
            else cb(true)
        })
    }
}