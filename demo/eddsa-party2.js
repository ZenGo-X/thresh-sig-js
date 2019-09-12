const { Ed25519Party2 } = require('../dist/src');
const crypto = require('crypto');
const EdDSA = require('kzen-elliptic').eddsa;
const eddsa = new EdDSA('ed25519');

const P1_ENDPOINT = 'http://localhost:8000';

async function generateTwoPartyEd25519Signature()  {
    const party2 = new Ed25519Party2(P1_ENDPOINT);
    const party2Share = await party2.generateKey();
    console.log(party2Share.getAggregatedPublicKey().apk.bytes_str);
    // <32-bytes-hex>
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2Share);
    console.log(JSON.stringify(signature));
    // {"R":{"bytes_str":<32-bytes-hex>},"s":<32-bytes-hex>}
    const sigHex = signature.toBuffer().toString('hex');
    console.log(sigHex);
    // <64-bytes-hex>
    console.log(eddsa.verify(msgHash, sigHex, party2Share.getPublicKey()));
    // true
}

generateTwoPartyEd25519Signature();