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
        // remove funds from sender
        cache.findOne('accounts', { name: tx.sender }, function (err, account) {
            account.assets[tx.data.asset] -= tx.data.amount
            cache.updateOne('accounts',
                { name: tx.sender },
                { $set: { assets: account.assets } },
                function () {
                    // check buy order in market
                    db.collection('market').find({ $and: [{ amount: { $gte: 1 } }, { price: { $gte: tx.data.price } }, { asset: tx.data.asset, type: "buy" }] }).toArray(function (err, orders) {
                        if (!orders || orders.length < 1) {
                            // add order to buy market if no sell match the price
                            db.collection('market').insertOne(
                                { name: tx.sender, amount: tx.data.amount, price: tx.data.price, type: "sell", asset: tx.data.asset },
                                function () {
                                   cb(true)
                                }
                            )
                        }
                        else
                        {
                            for (let index = 0; index < orders.length; index++) {
                                let order = orders[index];
                                if (order.amount > tx.data.amount) {
                                    order.amount -= tx.data.amount;
                                    //todo add assets
                                    cache.updateOne('accounts',
                                        { name: tx.sender },
                                        { $inc: { balance: + tx.data.amount } },
                                        function () {
                                            if (order.amount > 0) db.collection('market').update({ "_id": order._id }, order);
                                            else db.collection('market').remove({ "_id": order._id });
                                            cb(true)
                                        })
                                }
                                else {
                                    tx.data.amount -= order.amount;
                                    cache.updateOne('accounts',
                                        { name: tx.sender },
                                        { $inc: { balance: + order.amount } },
                                        function () {
                                            cache.findOne('accounts', { name: order.name }, function (err, account) {
                                                var assets = account.assets || {};
                                                if (assets[tx.data.asset]) assets[tx.data.asset] += tx.data.amount
                                                else assets[tx.data.asset] = tx.data.amount
                                                cache.updateOne('accounts',
                                                    { name: order.name },
                                                    { $set: { assets: account.assets } },
                                                    function () {
                                                        db.collection('market').remove({ "_id": order._id });
                                                        cb(true)
                                                    })
                                            })
                                        })
                                }
                            }
                            if(tx.data.amount>0)
                            {
                                db.collection('market').insertOne(
                                    { name: tx.sender, amount: tx.data.amount, price: tx.data.price, type: "sell", asset: tx.data.asset },
                                    function () {
                                        cb(true)
                                    }
                                ) 
                            }
                            else cb(true)
                        }
                        
                    })
                }
            )
        })
    }
}