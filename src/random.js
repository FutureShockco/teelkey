const bigInt = require('big-integer')
const sha512 = require('hash.js/lib/hash/sha/512')

var random = {
    transactionSeed: function(block, tx) {
        return sha512().update(block.hash+tx).digest('hex')
    },
    seed: function(block, tx, cb) {
            var txSeed = random.transactionSeed(block, tx)
            var finalSeed = sha512().update(txSeed).digest('hex')
            cb(finalSeed)
    },
    checkseed: function(block, tx, cb) {
            var txSeed = random.transactionSeed(block, tx)
            var finalSeed = sha512().update(txSeed).digest('hex')
            return cb(finalSeed)
    },
    next: function(seed) {
        return sha512().update(seed).digest('hex')
    },
    number: function(seed, interval) {
        var result = bigInt(seed, 16)
        //console.log(result)
        if (!interval) return result
        if (interval) {
            var range = interval.max - interval.min
            var granularity = range
            if (interval.precision != 0)
                granularity *= Math.pow(10, interval.precision)
            var random = Number(result.mod(granularity).value)
            if (interval.precision != 0)
                random /= Math.pow(10, interval.precision)
            if (!random)
                console.log('ERROR', random, range, granularity)
            return random
        }
    }
}

module.exports = random