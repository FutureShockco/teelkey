// Should be ordered by transaction types below.
var transactions = [
    require('./newAccount.js'),
    require('./approveNode.js'),
    require('./disaproveNode.js'),
    require('./transfer.js'),
    require('./comment.js'),
    require('./vote.js'),
    require('./userJson.js'),
    require('./follow.js'),
    require('./unfollow.js'),
    null,
    require('./newKey.js'),
    require('./removeKey.js'),
    require('./changePassword.js'),
    require('./promotedComment.js'),
    require('./transferVt.js'),
    require('./transferBw.js'),
    require('./transferAsset.js'),
    require('./transferNft.js'),
    require('./bidNft.js'),
    require('./sellNft.js'),
    require('./buyAsset.js'),
    require('./sellAsset.js'),
    require('./userMasterJson.js')
]

module.exports = {
    Types: {
        NEW_ACCOUNT: 0,
        APPROVE_NODE_OWNER: 1,
        DISAPROVE_NODE_OWNER: 2,
        TRANSFER: 3,
        COMMENT: 4,
        VOTE: 5,
        USER_JSON: 6,
        FOLLOW: 7,
        UNFOLLOW: 8,
        // RESHARE: 9, // not sure
        NEW_KEY: 10,
        REMOVE_KEY: 11,
        CHANGE_PASSWORD: 12,
        PROMOTED_COMMENT: 13,
        TRANSFER_VT: 14,
        TRANSFER_BW: 15,
        TRANSFER_ASSET: 16,
        TRANSFER_NFT: 17,
        BID_NFT: 18,
        SELL_NFT: 19,
        BUY: 20,
        SELL: 21,
        USER_MASTER_JSON: 22,
    },
    validate: (tx, ts, legitUser, cb) => {
        // will make sure the transaction type exists (redondant ?)
        if (!transactions[tx.type]) {
            logr.debug('error shouldnt happen but did:')
            cb(false, 'forbidden transaction type'); return
        }
        // enforce there's no unknown field included in the transaction
        for (let i = 0; i < Object.keys(tx.data).length; i++)
            if (transactions[tx.type].fields.indexOf(Object.keys(tx.data)[i]) === -1) {
                console.log(tx.data,transactions[tx.type].fields)
                cb(false, 'unknown tx.data.'+Object.keys(tx.data)[i])
                return
            }
        transactions[tx.type].validate(tx, ts, legitUser, cb)
    },
    execute: (tx, ts, cb) => {
        if (!transactions[tx.type]) {
            cb(false); return
        }
        transactions[tx.type].execute(tx, ts, cb)
    }
}