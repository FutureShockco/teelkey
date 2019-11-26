// Should be ordered by transaction types below.
var transactions = [
    require('./newAccount.js'),//0
    require('./approveNode.js'),//1
    require('./disaproveNode.js'),//2
    require('./transfer.js'),//3
    require('./comment.js'),//4
    require('./vote.js'),//5
    require('./userJson.js'),//6
    require('./follow.js'),//7
    require('./unfollow.js'),//8
    require('./newKey.js'),//9
    require('./removeKey.js'),//10
    require('./changePassword.js'),//11
    require('./changeRecoveryAccount'),//12
    require('./recoverAccount.js'),//13
    require('./promotedComment.js'),//14
    require('./transferVt.js'),//15
    require('./transferBw.js'),//16
    require('./transferAsset.js'),//17
    require('./transferNft.js'),//18
    require('./bidNft.js'),//19
    require('./sellNft.js'),//20
    require('./tradeNft.js'),//21
    require('./buyAsset.js'),//22
    require('./sellAsset.js'),//23
    require('./userMasterJson.js')//24
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
        NEW_KEY: 9,
        REMOVE_KEY: 10,
        CHANGE_PASSWORD: 11,
        CHANGE_RECOVERY: 12,
        RECOVER_ACCOUNT: 13,
        PROMOTED_COMMENT: 14,
        TRANSFER_VT: 15,
        TRANSFER_BW: 16,
        TRANSFER_ASSET: 17,
        TRANSFER_NFT: 18,
        BID_NFT: 19,
        SELL_NFT: 20,
        TRADE_NFT: 21,
        BUY: 22,
        SELL: 23,
        USER_MASTER_JSON: 24,
    },
    validate: (tx, ts, legitUser, cb) => {
        console.log(tx)
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