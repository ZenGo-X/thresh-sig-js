const { SchnorrParty2 } = require('../dist/src');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

async function generateTwoPartySchnorrSignature()  {
    const party2 = new SchnorrParty2(P1_ENDPOINT);
    const party2Share = await party2.generateKey();
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2Share);
    console.log(JSON.stringify(signature));
    // {"e": <32-bytes-hex>,"s": <32-bytes-hex>}
}

generateTwoPartySchnorrSignature();