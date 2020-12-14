[![Build Status](https://travis-ci.org/ZenGo-X/thresh-sig-js.svg?branch=master)](https://travis-ci.org/KZen-networks/thresh-sig-js)
[![NPM](https://img.shields.io/npm/v/@kzen-networks/thresh-sig.svg)](https://www.npmjs.org/package/@kzen-networks/thresh-sig)

Two Party signatures JS SDK 
=====================================
Supports:

|        Algorithm         |   Curve   |    Compatible blockchains       | 
|-------------------------------|------------------------|------------------------|
|    **ECDSA**    |      Secp256k1 |      Bitcoin, Ethereum           |
|    **Schnorr**    |        Secp256k1 | Zilliqa |
|    **EdDSA** | Curve25519 |  Tezos, Libra |

## Installation:
1. If on Linux, install needed packages:
```sh
$ sudo apt-get update
$ sudo apt-get install libgmp3-dev pkg-config libssl-dev clang libclang-dev
```
2. Install [Node.js](https://nodejs.org/en/download/)<br>
(tested on Node 10)
3. Install [nightly Rust](https://github.com/rust-lang/rustup.rs#installation)<br>
(tested on rustc 1.38.0-nightly (0b680cfce 2019-07-09))
4. Install the package:
```bash
$ npm install @kzen-networks/thresh-sig
```
Alternatively, clone it:
```bash
$ git clone https://github.com/KZen-networks/thresh-sig-js
$ cd thresh-sig-js
$ npm install
$ npm run build
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
    const party2Share = await party2.generateKey();
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2Share);
    console.log(JSON.stringify(signature));
    // {"e": <32-bytes-hex>,"s": <32-bytes-hex>}
})();
```

EdDSA party two:
```js
const { Ed25519Party2 } = require('@kzen-networks/thresh-sig');
const crypto = require('crypto');

const P1_ENDPOINT = 'http://localhost:8000';

(async () => {
    const party2 = new Ed25519Party2(P1_ENDPOINT);
    const party2Share = await party2.generateKey();
    console.log(party2Share.getAggregatedPublicKey().apk.bytes_str);
    // <32-bytes-hex>
    const msgHash = crypto.createHash('sha256').update('some message').digest();
    const signature = await party2.sign(msgHash, party2Share);
    console.log(JSON.stringify(signature));
    // {"R":{"bytes_str":<32-bytes-hex>},"s":<32-bytes-hex>}
})()
```

## Demo:

You can run a command line demo and see the two-party signing protocol in action. <br>
Party one:
```
$ node ./demo/party1.js
🔧 Configured for production.
    => address: 0.0.0.0
    => port: 8000
    => log: critical
    => workers: 24
    => secret key: generated
    => limits: forms = 32KiB
    => keep-alive: 5s
    => tls: disabled
🚀 Rocket has launched from http://0.0.0.0:8000
```
Party two (separate shell) - 
1. ECDSA:
```
$ node ./demo/ecdsa-party2.js
{"r":"b3d6168cc8ab6da64697b9e81c55863078da65cac7bbebc3d3f747dae0c6ac16","s":"449052412e20e510f8d4e31d721b3ef42199a9886a58a058c42d142b5850a177","recid":0}
```
2. Schnorr:
```
$ node ./demo/schnorr-party2.js
{"e":"d960b3fe66d2dc1c2115c93b3e674344d73063c22148ff3bc8d67493ffb19814","s":"ed2ecaa8882ccaac946bf951835033d4326aaff2e1e466ecf1fdda32a6fc762b"}
```
3. EdDSA:
```
$ node ./demo/eddsa-party2.js
{"R":{"bytes_str":"d86c5da0a257fd66acd007776f28d9f7a5083f84c66a41c98104c11cc5e9eaa3"},"s":"9964b5053843d6f6ddfaa25977f14f55676ae8a0e6bf89eafb412f417257abc"}
```

## Contact
Feel free to [reach out](mailto:github@kzencorp.com) or join ZenGo X [Telegram](https://t.me/zengo_x) for discussions on code and research.
