Threshold signatures
=====================================
Javascript threshold signatures SDK (for curve Secp256k1).<br>
Supports:
* Two-Party ECDSA
* Two-Party Schnorr (compatible with [Zilliqa's Schnorr signatures](https://github.com/Zilliqa/Zilliqa-JavaScript-Library/tree/dev/packages/zilliqa-js-crypto))

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
ECDSA party two:
```js
const { EcdsaParty2 } = require('@kzen-networks/thresh-sig');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

(async () => {
    const party2 = new EcdsaParty2(P1_ENDPOINT);
    const party2MasterKeyShare = await party2.generateMasterKey();
    const party2ChildShare = party2.getChildShare(party2MasterKeyShare, 0, 0);
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2ChildShare, 0, 0);
    console.log(JSON.stringify(signature));
    // {"r": <32-bytes-hex>,"s": <32-bytes-hex>,"recid": <0 or 1>}
})();
```

Schnorr party two:
```js
const { SchnorrParty2 } = require('@kzen-networks/thresh-sig');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

(async () => {
    const party2 = new SchnorrParty2(P1_ENDPOINT);
    const party2Share = await party2.generateMasterKey();
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2Share);
    console.log(JSON.stringify(signature));
    // {"e": <32-bytes-hex>,"s": <32-bytes-hex>}
})();
```