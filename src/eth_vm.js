const BN = require('bn.js')
var VM = require('ethereumjs-vm').default
const vm = new VM()

const STOP = '00'
const ADD = '01'
const PUSH1 = '60'

// Note that numbers added are hex values, so '20' would be '32' as decimal e.g.
const code = [PUSH1, '03', PUSH1, '05', ADD, STOP]

vm.on('step', function (data) {
    console.log(`Opcode: ${data.opcode.name}\tStack: ${data.stack}`)
})

vm.runCode({
    code: Buffer.from(code.join(''), 'hex'),
    gasLimit: new BN(0xffff),
})
    .then(results => {
        console.log('Returned : ' + results.returnValue.toString('hex'))
        console.log('gasUsed  : ' + results.gasUsed.toString())
    })
    .catch(err => console.log('Error    : ' + err))

module.exports = vm