Threshold signatures
=====================================
Javascript threshold signatures SDK using two-party ECDSA (for curve Secp256k1).

### Installation:
```
$ npm install @kzen/thresh-sig
```
### Build:
```
$ npm run build
```
### Start party one's server: 
(acts as the co-signer in the two-party signature scheme):
```
$ npm run start-p1-server
```
### Example:
```js
const { Party2 } = require('@kzen/thresh-sig');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

const party2 = new Party2(P1_ENDPOINT);
const party2MasterKeyShare = party2.generateMasterKey();
const party2ChildShare = party2.getChildShare(party2MasterKeyShare, 0, 0);
const msgHash = crypto.createHash('sha256').update('some message').digest();
const signature = party2.sign(msgHash, party2ChildShare, 0, 0);
console.log(signature);
// {r: <32-bytes-hex>, s: <32-bytes-hex>, recid: <0 or 1>} 
```

### Test:
```
$ npm test
```