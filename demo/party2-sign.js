const { Party2 } = require('../dist/src');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

const party2 = new Party2(P1_ENDPOINT);

(async () => {
    const party2MasterKeyShare = await party2.generateMasterKey();
    const party2ChildShare = party2.getChildShare(party2MasterKeyShare, 0, 0);
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2ChildShare, 0, 0);
    console.log(JSON.stringify(signature));
    // {"s":"5aabad9bae10dcefd0327ae4bc5177f9c2090034e011e2370caa82c4342bdc4b","r":"2ef845b92a67ed4b5300f1a7abd3a524488c91c2aa832ffc6624340d4aa6c86","recid":0}
})();