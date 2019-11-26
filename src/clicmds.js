var config = require('./config.js').read(0)
var CryptoJS = require('crypto-js')
const secp256k1 = require('secp256k1')
const bs58 = require('base-x')(config.b58Alphabet)
//const bs58 = require('bs58')
let sign = (privKey, sender, tx) => {
    // parsing the tx
    tx = JSON.parse(tx)
    // add timestamp to seed the hash (avoid transactions reuse)
    tx.sender = sender
    tx.ts = new Date().getTime()
    var txString = JSON.stringify(tx)
    // hash the transaction
    tx.hash = CryptoJS.SHA256(txString).toString()

    // decode the key
    var rawPriv = bs58.decode(privKey)

    // sign the tx
    var signature = secp256k1.sign(Buffer.from(tx.hash, 'hex'), rawPriv)

    // convert signature to base58
    tx.signature = bs58.encode(signature.signature)

    return tx
}

let cmds = {
    sign: (priv, sender, tx) => {
        return sign(priv, sender, tx)
    },
    //0
    createAccount: (privKey, sender, pub, name) => {
        var tx = '{"type":0,"data":{"pub":"'+pub+'","name":"'+name+'"}}'
        return sign(privKey, sender, tx)
    }, 
    //1
    approveNode: (privKey, sender, nodeName) => {
        var tx = '{"type":1,"data":{"target":"'+ nodeName +'"}}'
        return sign(privKey, sender, tx)
    }, 
    //2
    disapproveNode: (privKey, sender, nodeName) => {
        var tx = '{"type":2,"data":{"target":"'+ nodeName +'"}}'
        return sign(privKey, sender, tx)
    },
    //3
    transfer: (privKey, sender, receiver, amount, memo) => {
        if (!memo) memo=''
        var tx = '{"type":3,"data":{"receiver":"'+
			receiver+'", "amount":'+
			parseInt(amount)+', "memo":"'+memo+'"}}'
        return sign(privKey, sender, tx)
    },
    //4
    post: (privKey, sender, uri, content) => {
        var tx = '{"type":4,"data":{"link":"'+
			uri+'","json":'+content+'}}'
        return sign(privKey, sender, tx)
    },
    //4
    comment: (privKey, sender, uri, pa, pp, content, weight, tag) => {
        var tx = '{"type":4,"data":{"link":"'+
			uri+'", "pa":"'+
			pa+'", "pp":"'+
			pp+'", "vt":'+
			parseInt(weight)+', "tag":"'+
			tag+'","json":'+content+'}}'
        return sign(privKey, sender, tx)
    },
    //5
    vote: (privKey, sender, link, author, weight, tag) => {
        if (!tag) tag = ''
        var tx = '{"type":5,"data":{"link":"'+
			link+'", "author":"'+
			author+'", "vt": '+
			parseInt(weight)+', "tag": "'+tag+'"}}'
        return sign(privKey, sender, tx)
    },
	//6
    profile: (privKey, sender, content) => {
        var tx = '{"type":6,"data":{"json":'+content+'}}'
        return sign(privKey, sender, tx)
    },
	//7
    follow: (privKey, sender, username) => {
        var tx = '{"type":7,"data":{"target":"'+username+'"}}'
        return sign(privKey, sender, tx)
    },
	//8
    unfollow: (privKey, sender, username) => {
        var tx = '{"type":8,"data":{"target":"'+username+'"}}'
        return sign(privKey, sender, tx)
    },
	//9
    newKey: (privKey, sender, id, pub, types) => {
        var tx = '{"type":9,"data":{"id":"'+
			id+'","pub":"'+
			pub+'","types":'+types+'}}'
        return sign(privKey, sender, tx)
    },
	//10
    removeKey: (privKey, sender, id) => {
        var tx = '{"type":10,"data":{"id":"'+id+'"}}'
        return sign(privKey, sender, tx)
    },
	//11
    changePassword: (privKey, sender, pub) => {
        var tx = '{"type":11,"data":{"pub":"'+pub+'"}}'
        return sign(privKey, sender, tx)
    },
    //12
    changeRecoveryAccount: (privKey, sender, user) => {
        var tx = '{"type":12,"data":{"user":"'+user+'"}}'
        return sign(privKey, sender, tx)
    },
    //13
    recoverAccount: (privKey, sender, user, pub) => {
        var tx = '{"type":13,"data":{"user":"'+user+'","pub":"'+pub+'"}}'
        return sign(privKey, sender, tx)
    },
    //14
    promotedComment: (privKey, sender, uri, pa, pp, content, weight, tag, burn) => {
        var tx = '{"type":14,"data":{"link":"'+
			uri+'", "pa":"'+
			pa+'", "pp":"'+
			pp+'", "vt":'+
			parseInt(weight)+', "tag":"'+
			tag+'","burn":'+burn+',"json":'+content+'}}'
        return sign(privKey, sender, tx)
    },
    //15
    transferVt: (privKey, sender, receiver, amount) => {
        var tx = '{"type":15,"data":{"receiver":"'+
			receiver+'", "amount":'+
			parseInt(amount)+'}}'
        return sign(privKey, sender, tx)
    },
    //16
    transferBw: (privKey, sender, receiver, amount) => {
        var tx = '{"type":16,"data":{"receiver":"'+
			receiver+'", "amount":'+
			parseInt(amount)+'}}'
        return sign(privKey, sender, tx)
    },
    //17
    transferAsset: (privKey, sender, receiver, amount, asset, memo) => {
        if (!memo) memo=''
        var tx = '{"type":17,"data":{"receiver":"'+
			receiver+'", "amount":'+
			parseInt(amount)+', "asset":"'+asset+'", "memo":"'+memo+'"}}'
        return sign(privKey, sender, tx)
    },
    //18
    transferNft: (privKey, sender, receiver, id, memo) => {
        if (!memo) memo=''
        var tx = '{"type":18,"data":{"receiver":"'+
			receiver+'", "id":"'+id+'", "memo":"'+memo+'"}}'
        return sign(privKey, sender, tx)
    },
    //19
    bidNft: (privKey, sender, id, price) => {
        var tx = `{"type":19,"data":{"id":"${id}",
			"price":${parseFloat(price)}}}`
        return sign(privKey, sender, tx)
    },
    //20
    sellNft: (privKey, sender, id, min_price, price) => {
        var tx = `{"type":20,"data":{"id":"${id}",
			"min_price":${parseFloat(min_price)},
			"price":${parseFloat(price)}}}`
        return sign(privKey, sender, tx)
    },
    //21
    tradeNft: (privKey, sender, id, ask) => {
        var tx = `{"type":21,"data":{"id":"${id}",
                "ask":"${ask}"}}`
        return sign(privKey, sender, tx)
    },
    //22
    buy: (privKey, sender, price, amount, asset) => {
        var tx = `{"type":22,"data":{"amount":${parseFloat(amount)},
			"price":${parseFloat(price)},"asset":"${asset}"}}`
        return sign(privKey, sender, tx)
    },
    //23
    sell: (privKey, sender, price, amount, asset) => {
        var tx = `{"type":23,"data":{"amount":${parseFloat(amount)},
			"price":${parseFloat(price)},"asset":"${asset}"}}`
        return sign(privKey, sender, tx)
    },
    //24
    masterJson: (privKey, sender, memo) => {
        var tx = '{"type":24,"data":{"memo":"'+memo+'"}}'
        return sign(privKey, sender, tx)
    },
}

module.exports = cmds
