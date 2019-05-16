Threshold signatures
=====================================
Javascript threshold signatures SDK using two-party ECDSA (for curve Secp256k1).

## Installation:
```bash
$ npm install @kzen-networks/thresh-sig
```
## Usage:

Start party one's server 
(acts as the co-signer in the two-party signature scheme):
```js
const { Party1 } = require('@kzen-networks/thresh-sig');
const p1 = new Party1();
p1.launchServer();
```
Party two:
```js
const { Party2 } = require('@kzen-networks/thresh-sig');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

(async () => {
    const party2 = new Party2(P1_ENDPOINT);
    const party2MasterKeyShare = await party2.generateMasterKey();
    const party2ChildShare = party2.getChildShare(party2MasterKeyShare, 0, 0);
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2ChildShare, 0, 0);
    console.log(JSON.stringify(signature));
    // {"r": <32-bytes-hex>,"s": <32-bytes-hex>,"recid": <0 or 1>}
})();
```