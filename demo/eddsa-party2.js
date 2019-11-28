const { Ed25519Party2 } = require('../dist/src');
const crypto = require('crypto');
const EdDSA = require('elliptic').eddsa;
const eddsa = new EdDSA('ed25519');

const P1_ENDPOINT = 'http://localhost:8000';

async function generateTwoPartyEd25519Signature()  {
    const party2 = new Ed25519Party2(P1_ENDPOINT);
    const party2Share = await party2.generateKey();
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2Share);
    console.log(JSON.stringify(signature));
    // {"R":{"bytes_str":<32-bytes-hex>},"s":<32-bytes-hex>}
}

generateTwoPartyEd25519Signature();
