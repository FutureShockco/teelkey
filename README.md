# Teelkey

## Get a node running

#### Dependencies
* [MongoDB](https://mongodb.com)
* [NodeJS](https://nodejs.org/en/download/) **v10** (LTS)
* [ntpd](https://linux.die.net/man/8/ntpd) or any NTP alternative for your system. ntpd comes pre-installed on most linux distributions

## Install and run an Teelkey node
* `npm install` to install nodejs dependencies
* Get your own keys with `node src/cli.js keypair`
* Save your keys
* Add your keys to `scripts/start.sh`
* `chmod +x scripts/start.sh`
* `./scripts/start.sh`

### Environment Variables
The `start.sh` shows the list of available environment variables you can set to make teelkey behave slightly differently from the default install.

### Resetting and replaying the chain

#### Full resync from peer to peer
Shut everything down, then `db.dropDatabase()` in mongo, and start the node. This will do a complete replay and verification of the chain. Depending on your CPU/RAM it might be extremely slow and take a long time on a long chain with many transactions.

#### Declaring your public node in your account profile
It is strongly recommended for all leaders to add a `node.ws` field to your profile as so:
```
node src/cli.js profile -K <key> -M <user> '{"node":{"ws":"ws://yourip:yourport"}}'
```

## Using Teelkey

### With CLI
You can use the CLI tool to transact with teelkey. Simply try `node src/cli --help` or `node src/cli <command> --help` for a full help.

### Using TeelkeyJS
[TeelkeyJS](https://www.npmjs.com/package/teelkeyjs) is the javascript wrapper for teelkey's API. Working on both browser and nodejs.

### SERVE A STATIC APP
Put your static app into the public repository and it will be served over your nodes:
Examples:
https://teelkey.com/

### HTTP API

Teelkey's API uses 100% JSON. The GET calls will allow you to fetch the public information which is already available through most of existent UI.

Examples:
* Account data: /account/:username, i.e https://teelkey.com/account/master

### Transacting (POST /transact)
Once you have an account and balance, your account will start generating bandwidth and voting power (respectively the bw and vt fields in your account data). You can consume those ressources by transacting.

Every transactions will have a bandwidth cost, calculated based on the number of bytes required for the storage of fyour transaction in a block.
Certain transaction types will require you to spend voting power, such as publishing a content, voting or tagging a content.

To transact, you need to use the /transact POST call of the Teelkey API.

Necessary for all transactions:
* *key*: your private key
* * Use -K MyKeyHere to use a plain-text key
* * Or use -F file.json to use a key inside a file to sign (this will prevent your key from showing on the screen too much)
* *user*: your username

#### Vote for a leader
* *target*: the node owner to approve
```
node src/cli.js vote-leader -K <key> -M <user> <target>

// alice votes for bob as a leader
node src/cli.js vote-leader -K 5DPwDJqTvMuykHimmZxThfKttPSNLzJjpbNtkGNnjPAf -M alice bob
```

#### Unvote a leader
* *target*: the node owner to approve
```
node src/cli.js vote-leader -K <key> -M <user> <target>

// charlie does not want to vote for daniel as a leader anymore
node src/cli.js unvote-leader -F charlie_key.txt -M charlie daniel
```

#### Transfer tokens
* *receiver*: username of the receiver of the transfer
* *amount*: number of tokens to transfer to the receiver.
* *memo*: arbitrary short text content
```
node src/cli.js transfer -K <bob_key> -M <user> <receiver> <amount> <memo>
// bob sends 50 TEEL to charles
node src/cli.js transfer -K HkUbQ5YpejWVSPt8Qgz8pkPGwkDrMn3XECd4Asn3ANB3 -M bob charles 50 'thank you'
```

#### Transfer asset
* *receiver*: username of the receiver of the transfer
* *amount*: number of tokens to transfer to the receiver.
* *asset*: ticker of the asset to transfer.
* *memo*: arbitrary short text content
```
node src/cli.js transfer-asset -K <bob_key> -M <user> <receiver> <amount> <asset> <memo>
// bob sends 50 DWD to charles
node src/cli.js transfer-asset -K HkUbQ5YpejWVSPt8Qgz8pkPGwkDrMn3XECd4Asn3ANB3 -M bob charles 50 DWD 'thank you'
```
#### Transfer NFT
* *receiver*: username of the receiver of the transfer
* *id*: unique ID of the non-fungible token.
* *memo*: arbitrary short text content
```
node src/cli.js transfer-nft -K <bob_key> -M <user> <receiver> <id> <memo>
// bob sends one unique token to charles
node src/cli.js transfer-nft -K HkUbQ5YpejWVSPt8Qgz8pkPGwkDrMn3XECd4Asn3ANB3 -M bob charles unique_id 'thank you'
```

#### Add a post / Commenting
* *link*: a short string to be used as the index of the content
* *parent_author*: the username of the author of the parent post
* *parent_link*: the link of the parent post
* *json*: arbitrary json input. example: `{"string":"aye", array:[1,2,3]}`
* *tag*: arbitrary short text content
* *weight* : the number of vote tokens to spend on this vote
```
node src/cli.js comment -K <key> -M <user> <link> <parent_author> <parent_link> <json>
```

#### Vote a post
* *link*: the link of the post to vote on
* *author*: the username of the author to vote on
* *weight*: the number of vote tokens to spend on this vote
* *tag*: arbitrary short text content
```
node src/cli.js vote -K <key> -M <user> <link> <author> <weight> <tag>
```

#### Edit your user json object
* *json*: arbitrary json input. example: `{"string":"aye", array:[1,2,3]}`
```
node src/cli.js profile -K <key> -M <user> <json>
```

#### Edit your user master json objet
Warning, on the official testnet and mainnet only the master account can update the master json of an account.

* *json*: arbitrary json input. example: `{"string":"aye", array:[1,2,3]}`
```
node src/cli.js master-json -K <key> -M <user> <json>
```

#### Follow a user
* *target*: the user to follow
```
node src/cli.js follow -K <key> -M <user> <target>
```

#### Unfollow a user
* *target*: the user to unfollow
```
node src/cli.js unfollow -K <key> -M <user> <target>
```

#### Signing a raw transaction

To create a transaction and export it to a file, you can use the `sign` CLI tool
```
node src/cli.js sign <priv_key> <user> <tx> > tmptx.json
```
For example to approve a node owner and publishing it only 5 seconds later:
```
node src/cli.js sign -K 4L1C3553KRETK3Y -M alice '{"type":1,"data":{"target":"miner1"}}' > tmptx.json
sleep 5
curl -H "Content-type:application/json" --data @tmptx.json http://localhost:3001/transact
```

### Other POST Calls

#### Mine Block
Will force the node to try to produce a block even if it's unscheduled. Useful for block #1 and working on development
```
curl  http://localhost:3001/mineBlock
``` 

#### Add peer
Manually force connection to a peer without having to restart the node
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addPeer
```

### Data storage

### MongoDB
Teelkey saves the state of the chain into mongodb after each block. You can easily query mongodb directly to get any data you want, that wouldn't be provided by the API itself.
```
mongo <db_name>
db.accounts.findOne({name:'master'})
db.blocks.findOne({_id: 0})
```
However be sure not to write to any collection used by teelkey in this database (namely the accounts, blocks and contents). If you do, your node will irremediably fork sooner or later.

### Elastic Search
Teelkey can also copy the accounts and contents into an elastic search database with [monstache](https://github.com/rwynn/monstache). A configuration file for monstache is provided in the root of this repository. Once running you can do text queries on accounts or contents like so: 

```
# search contents
curl http://localhost:9200/teelkey.contents/_search?q=football
# search accounts
curl http://localhost:9200/teelkey.accounts/_search?q=satoshi
```
Please refer to Elastic Search documentation for more complex queries.

### Credits
We would like to give all the credits to the people making available these resources.
- Avalon : https://github.com/dtube/avalon
