const series = require('run-series')
const one_day = 86400000
var TransactionType = require('./transactions').Types

var eco = {
    currentBlock: {
        dist: 0,
        burn: 0,
        votes: 0
    },
    nextBlock: () => {
        eco.currentBlock.dist = 0
        eco.currentBlock.burn = 0
        eco.currentBlock.votes = 0
    },
    activeUsersCount: (cb) => {
        // we consider anyone with a non zero balance to be active, otherwise he loses out
        db.collection('accounts').find({balance: {$gt: 0}}).count(function(err, count) {
            if (err) throw err
            cb(config.rewardPoolMult*count+config.rewardPoolMin)
        })
    },
    totalSupply: (cb) => {
        db.collection('accounts').aggregate([
            {$match: {}},
            {
                $group: {
                    _id: null,
                    count: {
                        $sum:'$balance'
                    }
                }
            }
        ]).toArray(function(err, res) {
            if (err) throw err
            cb(res)
        })
    },
    theoricalRewardPool: (cb) => {
        eco.activeUsersCount(function(activeUsers) {
            // will need tuning for different experiments
            cb(activeUsers)
        })
    },
    rewardPool: (cb) => {
        // this might need to get reduced in the future as volume grows
        eco.theoricalRewardPool(function(theoricalPool){
            var burned = 0
            var distributed = 0
            var votes = 0
            var firstBlockIndex = chain.recentBlocks.length - config.ecoBlocks
            if (firstBlockIndex < 0) firstBlockIndex = 0
            for (let i = firstBlockIndex; i < chain.recentBlocks.length; i++) {
                const block = chain.recentBlocks[i]
                if (block.burn)
                    burned += block.burn
                if (block.dist)
                    distributed += block.dist
                
                for (let y = 0; y < block.txs.length; y++) {
                    var tx = block.txs[y]
                    if (tx.type === TransactionType.VOTE
                        || tx.type === TransactionType.COMMENT
                        || tx.type === TransactionType.PROMOTED_COMMENT)
                        votes += Math.abs(tx.data.vt)
                }
            }
            var avail = theoricalPool - distributed - eco.currentBlock.dist
            if (avail < 0) avail = 0
            cb({
                theo: theoricalPool,
                burn: burned + eco.currentBlock.burn,
                dist: distributed + eco.currentBlock.dist,
                votes: votes + eco.currentBlock.votes,
                avail: avail
            })
        })
    },
    accountPrice: (username) => {
        var charDiff = config.accountPriceChars - username.length
        var multiplier = Math.pow(config.accountPriceCharMult, charDiff)
        var price = Math.ceil(multiplier * config.accountPriceBase)
        return price + config.accountPriceMin
    },
    curation: (author, link, cb) => {
        cache.findOne('contents', {_id: author+'/'+link}, function(err, content) {
            // first loop to calculate the vp per day of each upvote
            var sumVt = 0
            for (let i = 0; i < content.votes.length; i++) {
                // first voter advantage is real !
                if (i === 0)
                    content.votes[i].vpPerDayBefore = 0
                // two similar votes at the same block/timestamp should be have equal earnings / vp per day
                else if (content.votes[i].ts === content.votes[i-1].ts)
                    content.votes[i].vpPerDayBefore = content.votes[i-1].vpPerDayBefore
                else
                    content.votes[i].vpPerDayBefore = one_day*sumVt/(content.votes[i].ts - content.votes[0].ts)
            
                sumVt += content.votes[i].vt
            }

            var currentVote = content.votes[content.votes.length-1]

            // second loop to filter winners
            var winners = []
            var sumVtWinners = 0
            for (let i = 0; i < content.votes.length-1; i++) {
                // votes from the same block cant win
                if (content.votes[i].ts === currentVote.ts)
                    continue
                
                // winners voted in the same direction
                if (content.votes[i].vt * currentVote.vt > 0) 
                    // upvotes win if they were done at a lower vp per day, the opposite for downvotes
                    if ((currentVote.vt > 0 && content.votes[i].vpPerDayBefore < currentVote.vpPerDayBefore)
                        || (currentVote.vt < 0 && content.votes[i].vpPerDayBefore > currentVote.vpPerDayBefore)) {
                        sumVtWinners += content.votes[i].vt
                        winners.push(content.votes[i])
                    }
                
            }

            // third loop to calculate each winner shares
            for (let i = 0; i < winners.length; i++)
                winners[i].share = winners[i].vt / sumVtWinners

            winners.sort(function(a,b) {
                return b.share - a.share
            })

            //logr.trace(currentVote, winners.length+'/'+content.votes.length+' won')

            // forth loop to pay out
            var executions = []
            for (let i = 0; i < winners.length; i++) 
                executions.push(function(callback) {
                    var payout = Math.floor(winners[i].share * Math.abs(currentVote.vt))
                    if (payout < 0) 
                        throw 'Fatal distribution error (negative payout)'
                    
                    if (payout === 0) {
                        callback(null, 0)
                        return
                    }
                    var memo = content.author+'/'+content.link+'/'+currentVote.u
                    eco.distribute(winners[i].u, payout, currentVote.ts, memo, function(dist) {
                        eco.currentBlock.dist += dist
                        eco.currentBlock.votes += payout
                        callback(null, dist)
                    })
                })
            
            series(executions, function(err, results) {
                if (err) throw err
                var newCoins = 0
                for (let r = 0; r < results.length; r++)
                    newCoins += results[r]
                cache.updateOne('contents', {_id: author+'/'+link}, {
                    $inc: {dist: newCoins}
                }, function() {
                    if (config.masterFee > 0 && newCoins > 0) {
                        var distBefore = content.dist
                        if (!distBefore) distBefore = 0
                        var distAfter = distBefore + newCoins
                        var benefReward = Math.floor(distAfter/config.masterFee) - Math.floor(distBefore/config.masterFee)
                        if (benefReward > 0) 
                            cache.updateOne('accounts', {name: config.masterName}, {$inc: {balance: benefReward}}, function() {
                                cache.insertOne('distributed', {
                                    name: config.masterName,
                                    dist: benefReward,
                                    ts: currentVote.ts,
                                    _id: content.author+'/'+content.link+'/'+currentVote.u+'/'+config.masterName
                                }, function() {
                                    cache.findOne('accounts', {name: config.masterName}, function(err, masterAccount) {
                                        masterAccount.balance -= benefReward
                                        transaction.updateGrowInts(masterAccount, currentVote.ts, function() {
                                            transaction.adjustNodeAppr(masterAccount, benefReward, function() {
                                                cb(newCoins, benefReward)
                                            })
                                        })
                                    })
                                })
                            })
                        else cb(newCoins, 0)
                    } else cb(newCoins, 0)
                })
            })
        })
    },
    distribute: (name, vt, ts, memo, cb) => {
        eco.rewardPool(function(stats) {
            cache.findOne('accounts', {name: name}, function(err, account) {
                if (err) throw err
                if (!account.uv) account.uv = 0

                if (stats.avail === 0) {
                    cb(0)
                    return
                }

                //logr.trace('DIST:', name, vt, ts, account.uv, stats)

                var thNewCoins = 0
                if (stats.votes === 0)
                    thNewCoins = 1
                else
                    thNewCoins = stats.avail * Math.abs((vt+account.uv) / stats.votes)

                var newCoins = Math.floor(thNewCoins)
                
                // make sure one person cant empty the whole pool
                // eg stats.votes = 0
                if (newCoins > Math.floor(stats.avail*config.rewardPoolMaxShare))
                    newCoins = Math.floor(stats.avail*config.rewardPoolMaxShare)

                if (vt<0) newCoins *= -1

                // calculate unpaid votes and keep them for the next distribute()
                var unpaidVotes = (thNewCoins-newCoins)
                unpaidVotes /= stats.avail
                unpaidVotes *= stats.votes
                if (vt<0) unpaidVotes = Math.ceil(unpaidVotes)
                else unpaidVotes = Math.floor(unpaidVotes)

                // unpaid votes is meant for minnows who struggle to print 1 unit
                // not the big whales where votes exceed the rewardPoolMaxShare
                if (config.capUnpaidVotes && unpaidVotes > Math.floor(stats.votes/stats.avail))
                    unpaidVotes = Math.floor(stats.votes/stats.avail)

                //console.log(newCoins, unpaidVotes)
                var changes = {
                    uv: unpaidVotes
                }

                if (newCoins > 0) {
                    // option 1: instant payments
                    var newBalance = account.balance + newCoins
                    changes.balance = newBalance

                    // option 2: payment reservoir where its possible to 'take away' rewards unlike option 1
                    // useful for models where downvotes should punish past upvoters
                    // var newPr = new DecayInt(account.pr, {halflife:1000*60*60*24}).decay(ts)
                    // var newBalance = account.balance + account.pr.v - newPr.v
                    // newPr.v += newCoins
                    // if (newPr.v < 0) newPr.v = 0
                    // changes.balance = newBalance
                    // changes.pr = newPr
                }
                
                cache.updateOne('accounts', {name: name}, {$set: changes}, function(){
                    if (newCoins > 0)
                        cache.insertOne('distributed', {
                            name: name,
                            dist: newCoins,
                            ts: ts,
                            _id: memo+'/'+name
                        }, function() {
                            transaction.updateGrowInts(account, ts, function() {
                                transaction.adjustNodeAppr(account, newCoins, function() {
                                    cb(newCoins)
                                })
                            })
                        })
                    else cb(newCoins)
                })
            })
        })
    }
} 

module.exports = eco