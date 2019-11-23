const series = require('run-series')
const cloneDeep = require('clone-deep')
var cache = {
    copy: {
        accounts: {},
        contents: {},
        distributed: {},
        changes: [],
        inserts: [],
        removes: [],
        market: [],
        nft_market: [],
        market_history: []

    },
    accounts: {},
    contents: {},
    distributed: {},
    changes: [],
    inserts: [],
    removes: [],
    market: [],
    nft_market: [],
    market_history: [],
    rollback: function() {
        for (const key in cache.copy.accounts)
            cache.accounts[key] = cloneDeep(cache.copy.accounts[key])
        for (const key in cache.copy.contents)
            cache.contents[key] = cloneDeep(cache.copy.contents[key])
        for (const key in cache.copy.distributed)
            cache.distributed[key] = cloneDeep(cache.copy.distributed[key])
        for (const key in cache.copy.changes)
            cache.changes[key] = cloneDeep(cache.copy.changes[key])
        for (const key in cache.copy.inserts)
            cache.inserts[key] = cloneDeep(cache.copy.inserts[key])
        for (const key in cache.copy.removes)
            cache.removes[key] = cloneDeep(cache.copy.removes[key])
        for (const key in cache.copy.market)
            cache.market[key] = cloneDeep(cache.copy.market[key])   
        for (const key in cache.copy.nft_market)
            cache.nft_market[key] = cloneDeep(cache.copy.nft_market[key])  
        for (const key in cache.copy.market)
            cache.market_history[key] = cloneDeep(cache.copy.market_history[key])   
        cache.copy.accounts = {}
        cache.copy.contents = {}
        cache.copy.distributed = {}
        cache.copy.changes = []
        cache.copy.inserts = []
        cache.copy.removes = []
        cache.copy.market = []
        cache.copy.nft_market = []
        cache.copy.market_history = []
        eco.nextBlock()
        //logr.trace('Cache rollback\'d')
    },
    findOne: function(collection, query, cb) {
        if (['accounts','blocks','contents','market','nft_market','market_history'].indexOf(collection) === -1) {
            cb(true)
            return
        }
        var key = cache.keyByCollection(collection)
        // searching in cache
        if (cache[collection][query[key]]) {
            let res = cloneDeep(cache[collection][query[key]])
            cb(null, res)
            return
        }
        
        // no match, searching in mongodb
        db.collection(collection).findOne(query, function(err, obj) {
            if (err) logr.debug('error cache')
            else {
                if (!obj) {
                    // doesnt exist
                    cb(); return
                }
                // found, adding to cache
                cache[collection][obj[key]] = obj

                // cloning the object before sending it
                let res = cloneDeep(obj)
                cb(null, res)
            }
        })
    },
    find: function(collection, query, sort, cb) {
        if (['market','nft_market','market_history'].indexOf(collection) === -1) {
            cb(true)
            return
        }
        // searching in mongodb
        db.collection(collection).find(query).sort(sort).toArray(function(err, obj) {
            if (err) logr.debug('error cache')
            else {
                // found, adding to cache
                cache[collection] = obj
                // cloning the object before sending it
                let res = cloneDeep(obj)
                cb(null, res)
            }
        })
    },
    updateOne: function(collection, query, changes, cb) {
        cache.findOne(collection, query, function(err, obj) {
            if (err) throw err
            if (!obj) {
                cb(null, false); return
            }
            var key = cache.keyByCollection(collection)

            if (!cache.copy[collection][obj[key]])
                cache.copy[collection][obj[key]] = cloneDeep(cache[collection][obj[key]])
            
            for (var c in changes) 
                switch (c) {
                case '$inc':
                    for (var i in changes[c]) 
                        if (!cache[collection][obj[key]][i])
                            cache[collection][obj[key]][i] = changes[c][i]
                        else
                            cache[collection][obj[key]][i] += changes[c][i]
                    
                    break

                case '$push':
                    for (var p in changes[c]) {
                        if (!cache[collection][obj[key]][p])
                            cache[collection][obj[key]][p] = []
                        cache[collection][obj[key]][p].push(changes[c][p])
                    }
                    break

                case '$pull':
                    for (var l in changes[c]) 
                        for (let y = 0; y < cache[collection][obj[key]][l].length; y++)
                            if (typeof changes[c][l] === 'object') {
                                var matching = true
                                for (const v in changes[c][l])
                                    if (cache[collection][obj[key]][l][y][v] !== changes[c][l][v]) {
                                        matching = false
                                        break
                                    }
                                if (matching)
                                    cache[collection][obj[key]][l].splice(y, 1)
                            } else if (cache[collection][obj[key]][l][y] === changes[c][l]) 
                                cache[collection][obj[key]][l].splice(y, 1)
                            
                    break

                case '$set':
                    for (var s in changes[c]) 
                        cache[collection][obj[key]][s] = changes[c][s]
                    
                    break
                
                default:
                    break
                }
            
            cache.changes.push({
                collection: collection,
                query: query,
                changes: changes
            })
            cb(null, true)
        })
    },
    updateMany: function(collection, query, changes, cb) {
        var key = cache.keyByCollection(collection)
        if (!query[key] || !query[key]['$in']) 
            throw 'updateMany requires a $in operator'
        

        var indexesToUpdate = query[key]['$in']
        var executions = []
        for (let i = 0; i < indexesToUpdate.length; i++) 
            executions.push(function(callback) {
                var newQuery = {}
                newQuery[key] = indexesToUpdate[i]
                cache.updateOne(collection, newQuery, changes, function(err, result) {
                    callback(null, result)
                })
            })
        
        series(executions, function(err, results) {
            cb(err, results)
        })
    },
    insertOne: function(collection, document, cb) {
        var key = cache.keyByCollection(collection)
        if (cache[collection][document[key]]) {
            cb(null, false); return
        }
        cache[collection][document[key]] = document
        cache.inserts.push({
            collection: collection,
            document: document
        })

        cb(null, true)
    },
    deleteOne: function(collection, document, cb) {
        cache.removes.push({
            collection: collection,
            document: document
        })
        cb(null, true)
    },
    clear: function() {
        cache.accounts = {}
        cache.contents = {}
        cache.distributed = {}
        cache.market = {}
        cache.nft_market = {}
        cache.market_history = {}
    },
    writeToDisk: function(cb) {
        var executions = []

        //todo resolve all expired orders for market

        //todo resolve all expired orders for nft_market

        // executing the inserts (new comment / new account)
        for (let i = 0; i < cache.inserts.length; i++)
            executions.push(function(callback) {
                var insert = cache.inserts[i]
                db.collection(insert.collection).insertOne(insert.document, function(err) {
                    if (err) throw err
                    callback()
                })
            })
        // executing the removes (completed orders / auctions)
        for (let i = 0; i < cache.removes.length; i++)
            executions.push(function(callback) {
                var remove = cache.removes[i]
                db.collection(remove.collection).deleteOne({_id:remove.document._id}, function(err) {
                    if (err) throw err
                    callback()
                })
            })   
        // then the update with simple operation compression
        // 1 update per document concerned (even if no real change)
        var docsToUpdate = {
            accounts: {},
            contents: {},
            distributed: {},
            market: {},
            nft_market: {},
            market_history: {}
        }
        for (let i = 0; i < cache.changes.length; i++) {
            var change = cache.changes[i]
            var collection = change.collection
            var key = change.query[cache.keyByCollection(collection)]
            docsToUpdate[collection][key] = cache[collection][key]
        }

        for (const col in docsToUpdate) 
            for (const i in docsToUpdate[col]) 
                executions.push(function(callback) {
                    var key = cache.keyByCollection(col)
                    var newDoc = docsToUpdate[col][i]
                    var query = {}
                    query[key] = newDoc[key]
                    db.collection(col).updateOne(query, {$set: newDoc}, function(err) {
                        if (err) throw err
                        callback()
                    })
                })

        // no operation compression (dumb and slow)
        // for (let i = 0; i < cache.changes.length; i++) {
        //     executions.push(function(callback) {
        //         var change = cache.changes[i]
        //         db.collection(change.collection).updateOne(change.query, change.changes, function() {
        //             callback()
        //         })
        //     })
        // }
        
        //var timeBefore = new Date().getTime()
        series(executions, function(err, results) {
            //logr.debug(executions.length+' mongo update executed in '+(new Date().getTime()-timeBefore)+'ms')
            cb(err, results)
            cache.changes = []
            cache.inserts = []
            cache.removes = []
            cache.copy.accounts = {}
            cache.copy.contents = {}
            cache.copy.distributed = {}
            cache.copy.changes = []
            cache.copy.inserts = []
            cache.copy.removes = []
            cache.copy.market = []
            cache.copy.nft_market = []
            cache.copy.market_history = []
        })
    },
    keyByCollection: function(collection) {
        switch (collection) {
        case 'accounts':
            return 'name'
        
        default:
            return '_id'
        }
    }
}

module.exports = cache