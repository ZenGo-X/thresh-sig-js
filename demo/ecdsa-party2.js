const { EcdsaParty2 } = require('../dist/src');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

async function generateTwoPartyEcdsaSignature()  {
    const party2 = new EcdsaParty2(P1_ENDPOINT);
    const party2MasterKeyShare = await party2.generateMasterKey();
    const party2ChildShare = party2.getChildShare(party2MasterKeyShare, 0, 0);
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2ChildShare, 0, 0);
    console.log(JSON.stringify(signature));
    // {"r": <32-bytes-hex>,"s": <32-bytes-hex>,"recid": <0 or 1>}
}

generateTwoPartyEcdsaSignature();