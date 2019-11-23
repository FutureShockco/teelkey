var config = require('./config.js').read(0)
var TransactionType = require('./transactions').Types
var cmds = require('./clicmds.js')
var program = require('commander')
const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
const bs58 = require('base-x')(config.b58Alphabet)
var fetch = require('node-fetch')
var fs = require('fs')
const defaultPort = 3001

program
    .version('0.2.0', '-V, --version')
    .description('a cli tool to forge transactions and broadcast to teelkey')
    .option('-K, --key [plaintext_key]', 'plain-text private key')
    .option('-F, --file [file_key]', 'file private key')
    .option('-M, --me [my_username]', 'username of the transactor')
    .option('-A, --api [api_url]', 'teelkey api url')
    .option('-S, --spam [delay_in_ms]', 'repeats the tx every delay')

program.command('account <pub_key> <new_user>')
    .description('create a new account')
    .action(function(pubKey, newUser) {
        verifyKeyAndUser()
        sendTx(cmds.createAccount(program.key, program.me, pubKey, newUser))
    }).on('--help', function(){
        writeLine('')
        writeLine('Extra Info:')
        writeLine('  Account creation will burn coins depending on the chain config')
        writeLine('  However, usernames matching public key are free (see second example)')
        writeLine('')
        writeLine('Examples:')
        writeLine('  $ account d2EdJPNgFBwd1y9vhMzxw6vELRneC1gSHVEjguTG74Ce cool-name -F key.json -M alice')
        writeLine('  $ account fR3e4CcvMRuv8yaGtoQ6t6j1hxfyocqhsKHi2qP9mb1E fr3e4ccvmruv8yagtoq6t6j1hxfyocqhskhi2qp9mb1e -F key.json -M alice')
    })

program.command('comment <link> <pa> <pp> <json> <vt> <tag>')
    .description('publish a new JSON content')
    .action(function(link, pa, pp, json, vt, tag) {
        verifyKeyAndUser()
        sendTx(cmds.comment(program.key, program.me, link, pa, pp, json, vt, tag))
    }).on('--help', function(){
        writeLine('')
        writeLine('Arguments:')
        writeLine('  <link>: an arbitrary string identifying your content')        
        writeLine('  <pa>: parent author (if you are replying to another comment)')
        writeLine('  <pp>: parent link (if you are replying to another comment)')
        writeLine('  <json>: a json object')
        writeLine('  <vt>: the amount of VT to spend on the forced vote')
        writeLine('  <tag>: the tag of the forced vote')
        writeLine('')
        writeLine('Examples:')
        writeLine('  $ comment root-comment \'\' \'\' \'{"body": "Hello World"}\' 777 my-tag -F key.json -M alice')
        writeLine('  $ comment reply-to-bob bobs-post bob \'{"body": "Hello Bob"}\' 1 my-tag -F key.json -M alice')
    })

program.command('follow <target>')
    .alias('subscribe')
    .description('start following another user')
    .action(function(target) {
        verifyKeyAndUser()
        sendTx(cmds.follow(program.key, program.me, target))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ follow bob -F key.json -M alice')
    })

program.command('keypair')
    .description('generate a new keypair')
    .alias('key')
    .option('-H, --has [text]', 'generated public key will contain the specified text')
    .action(function(options) {
        var has = (options.has || '')
        has = has.toLowerCase()
        var priv
        var pub
        var pub58
        do {
            priv = randomBytes(config.randomBytesLength)
            pub = secp256k1.publicKeyCreate(priv)
            pub58 = bs58.encode(pub)
        } while ((pub58.toLowerCase().indexOf(has) === -1) 
            || !secp256k1.privateKeyVerify(priv))

        writeLine(JSON.stringify({
            pub: pub58,
            priv: bs58.encode(priv)
        }))
    }).on('--help', function(){
        writeLine('')
        writeLine('Tip:')
        writeLine('  You can save your keys to a file with the \'>\' operator, and then use -F option instead of -K for signing txs.')
        writeLine('  This will prevent your private key from getting in your clipboard or showing up on the screen.')
        writeLine('')
        writeLine('Examples:')
        writeLine('  $ keypair')
        writeLine('  $ keypair > file.json')
        writeLine('  $ keypair --has bob')
    })

program.command('license')
    .description('read the software license')
    .action(function() {
        writeLine('Copyright (c) 2018 Adrien Marie. https://d.tube')
        writeLine('')
        writeLine('Permission is hereby granted, free of charge, to any person obtaining a copy')
        writeLine('of this software and associated documentation files (the "Software"), to deal')
        writeLine('in the Software without restriction, including without limitation the rights')
        writeLine('to use, copy, modify, merge, publish, distribute, sublicense, and/or sell')
        writeLine('copies of the Software, and to permit persons to whom the Software is')
        writeLine('furnished to do so, subject to the following conditions:')
        writeLine('')
        writeLine('The above copyright notice and this permission notice shall be included in')
        writeLine('all copies or substantial portions of the Software.')
        writeLine('')
        writeLine('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR')
        writeLine('IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,')
        writeLine('FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE')
        writeLine('AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER')
        writeLine('LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,')
        writeLine('OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN')
        writeLine('THE SOFTWARE.')
    })

program.command('new-key <id> <pub> <allowed_txs>')
    .description('add new key with custom perms')
    .action(function(id, pub, allowedTxs) {
        verifyKeyAndUser()
        sendTx(cmds.newKey(program.key, program.me, id, pub, allowedTxs))
    }).on('--help', function(){
        writeLine('')
        writeLine('Transaction Types:')
        for (const key in TransactionType)
            writeLine('  '+TransactionType[key]+': '+key)
        writeLine('')
        writeLine('Examples:')
        writeLine('  $ new-key posting tWWLqc5wPTbXPaWrFAfqUwGtEBLmUbyavp3utwPUop2g [4,5,6,7,8] -F key.json -M alice')
        writeLine('  $ new-key finance wyPSnqfmAKoz5gAWyPcND7Rot6es2aFgcDGDTYB89b4q [3] -F key.json -M alice')
    })

program.command('password <pub>')
    .description('change your master key')
    .action(function(pub) {
        verifyKeyAndUser()
        sendTx(cmds.changePassword(program.key, program.me, pub))
    }).on('--help', function(){
        writeLine('')
        writeLine('Arguments:')
        writeLine('  <pub>: the new public key that will have full control over your account')
        writeLine('')
        writeLine('WARNING:')
        writeLine('  DO NOT lose the new associated private key!')
        writeLine('')
        writeLine('Example:')
        writeLine('  $ change-password tK9DqTygrcwGWZPsyVtZXNpfiZcAZN83nietKbKY8aiH -F key.json -M alice')
    })

program.command('profile <json>')
    .alias('user-json')
    .description('modify an account profile')
    .action(function(json) {
        verifyKeyAndUser()
        sendTx(cmds.profile(program.key, program.me, json))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ profile \'{"profile":{"avatar":"https://i.imgur.com/4Bx2eQt.jpg"}}\' -F key.json -M bob')
    })

program.command('master-json <target> <json>')
    .description('modify an account masterjson')
    .action(function(json) {
        verifyKeyAndUser()
        sendTx(cmds.masterJson(program.key, program.me, json))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ master-json alice \'{"socials":[{"facebook":"fb_id"}]}\' -F key.json -M master')
    })

program.command('promote <link> <pa> <pp> <json> <vt> <tag> <burn>')
    .description('publish and promote')
    .action(function(link, pa, pp, json, vt, tag, burn) {
        verifyKeyAndUser()
        sendTx(cmds.promotedComment(program.key, program.me, link, pa, pp, json, vt, tag, burn))
    }).on('--help', function(){
        writeLine('')
        writeLine('Arguments:')
        writeLine('  <link>: an arbitrary string identifying your content')        
        writeLine('  <pa>: parent author (if you are replying to another comment)')
        writeLine('  <pp>: parent link (if you are replying to another comment)')
        writeLine('  <json>: a json object')
        writeLine('  <vt>: the amount of VT to spend on the forced vote')
        writeLine('  <tag>: the tag of the forced vote')
        writeLine('  <burn>: the amount of coins to burn for promotion')
        writeLine('')
        writeLine('WARNING:')
        writeLine('  Your balance will be reduced by <burn> coins')
        writeLine('')
        writeLine('Example:')
        writeLine('  $ promote big-video \'\' \'\' \'{"title": "Check this out"}\' 777 my-tag 10 -F key.json -M alice')
    })

program.command('remove-key <id>')
    .description('remove a previously added key')
    .action(function(id) {
        verifyKeyAndUser()
        sendTx(cmds.removeKey(program.key, program.me, id))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ remove-key posting -F key.json -M alice')
    })

program.command('sign <transaction>')
    .description('sign a tx w/o broadcasting')
    .action(function(transaction) {
        verifyKeyAndUser()
        writeLine(JSON.stringify(cmds.sign(program.key, program.me, transaction)))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ sign \'{"type":1,"data":{"target":"bob"}}\' -F key.json -M alice')
    })

program.command('transfer <receiver> <amount> [memo]')
    .alias('xfer')
    .option('--memo [text]', 'add a short message to the transfer')    
    .description('transfer coins')
    .action(function(receiver, amount, options) {
        verifyKeyAndUser()
        var memo = ''
        if (options && options.memo) memo = options.memo
        sendTx(cmds.transfer(program.key, program.me, receiver, amount, memo))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ transfer bob 777 "thank you" -F key.json -M alice')
    })

program.command('transfer-asset <receiver> <amount> <asset> [memo]')
    .alias('xfer-asset')
    .description('transfer asset')
    .action(function(receiver, amount, asset, memo) {
        verifyKeyAndUser()
        sendTx(cmds.transferAsset(program.key, program.me, receiver, amount, asset, memo))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ xfer-asset bob 777 XBTC -F key.json -M alice')
    })

program.command('buy <price> <amount> <asset>')
    .description('put a buy order for an asset')
    .action(function(price, amount, asset) {
        verifyKeyAndUser()
        sendTx(cmds.buy(program.key, program.me, price, amount, asset))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ buy 1 10 DWD -F key.json -M bob')
    })
 
program.command('sell <price> <amount> <asset>')
    .description('put a sell order for an asset')
    .action(function(price, amount, asset) {
        verifyKeyAndUser()
        sendTx(cmds.sell(program.key, program.me, price, amount, asset))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ sell 1 10 DWD -F key.json -M bob')
    })   
    
program.command('sell-nft <id> <min_price> <price> ')
    .description('put a sell order for an NFT')
    .action(function(id, min_price, price) {
        verifyKeyAndUser()
        sendTx(cmds.sellNft(program.key, program.me, id, min_price, price))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ sell-nft uniqueid 10 100 -F key.json -M bob')
    })         
    
program.command('bid-nft <id> <price>')
    .description('put a bid order for an NFT')
    .action(function(id, price) {
        verifyKeyAndUser()
        sendTx(cmds.bidNft(program.key, program.me, id, price))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ bid-nft uniqueid 10 -F key.json -M bob')
    })          

program.command('transfer-nft <receiver> <id> [memo]')
    .alias('xfer-nft')
    .description('transfer nft')
    .action(function(receiver, id, memo) {
        verifyKeyAndUser()
        sendTx(cmds.transferNft(program.key, program.me, receiver, id, memo))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ xfer-nft bob nftUniqueID -F key.json -M alice')
    })

program.command('transfer-bw <receiver> <amount>')
    .alias('xfer-bw')
    .description('transfer bandwidth')
    .action(function(receiver, amount) {
        verifyKeyAndUser()
        sendTx(cmds.transferBw(program.key, program.me, receiver, amount))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ xfer-bw dan 777 -F key.json -M alice')
    })

program.command('transfer-vp <receiver> <amount>')
    .alias('xfer-vp')
    .description('transfer voting power')
    .action(function(receiver, amount) {
        verifyKeyAndUser()
        sendTx(cmds.transferVt(program.key, program.me, receiver, amount))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ xfer-vp charlotte 777 -F key.json -M alice')
    })

program.command('unfollow <target>')
    .alias('unsubscribe')
    .description('stop following another user ')
    .action(function(target) {
        verifyKeyAndUser()
        sendTx(cmds.unfollow(program.key, program.me, target))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ unfollow bob -F key.json -M alice')
    })

program.command('unvote-leader <leader>')
    .description('remove a leader vote')
    .action(function(leader) {
        verifyKeyAndUser()
        sendTx(cmds.disapproveNode(program.key, program.me, leader))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ unvote-leader bob -F key.json -M alice')
    })

program.command('vote <link> <author> <vt> <tag>')
    .description('vote for a content')
    .action(function(link, author, vt, tag) {
        verifyKeyAndUser()
        sendTx(cmds.vote(program.key, program.me, link, author, vt, tag))
    }).on('--help', function(){
        writeLine('')
        writeLine('Arguments:')
        writeLine('  <link>: the identifier of the comment to vote on')        
        writeLine('  <author>: the author of the comment to vote on')
        writeLine('  <vt>: the amount of VT to spend on the vote')
        writeLine('  <tag>: the tag to associate with the vote')
        writeLine('')
        writeLine('Examples:')
        writeLine('  $ vote root-comment alice 1000 introduce-yourself -F key.json -M bob')
    })

program.command('vote-leader <leader>')
    .description('vote for a leader')
    .action(function(leader) {
        verifyKeyAndUser()
        sendTx(cmds.approveNode(program.key, program.me, leader))
    }).on('--help', function(){
        writeLine('')
        writeLine('Example:')
        writeLine('  $ vote-leader bob -F key.json -M alice')
    })
















    // error on unknown commands
program.on('command:*', function () {
    writeLine('Unknown command: '+program.args[0])
    writeLine('See --help for a list of available commands.')
    process.exit(1)
})

program.parse(process.argv)

function writeLine(str){process.stdout.write(str+'\n')}

function sendTx(tx) {
    var port = process.env.API_PORT || defaultPort
    var ip = process.env.API_IP || '[::1]'
    var protocol = process.env.API_PROTOCOL || 'http'
    var url = protocol+'://'+ip+':'+port+'/transact'
    if (program.api)
        url = program.api+'/transact'
    fetch(url, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tx)
    }).then(function(res) {
        return res.json()
    }).then(function(res) {
        if (res.error)
            writeLine('Error: '+res.error)
        else
            writeLine(res)
    }).catch(function(error) {
        writeLine('Err: ' + error)
    })
    if (program.spam && program.spam > 0)
        setTimeout(function(){
            var newTx = JSON.stringify(tx)
            sendTx(cmds.sign(program.key, program.me, newTx))
        }, program.spam)
}

function verifyKeyAndUser() {
    if (program.file) {
        var file = fs.readFileSync(program.file, 'utf8')
        try {
            program.key = JSON.parse(file).priv
        } catch (error) {
            program.key = file.trim()
        }
    }
    if (!program.key) {
        writeLine('no key?')
        process.exit(1)
    }
    if (!program.me) {
        writeLine('no user?')
        process.exit(1)
    }
}
