const {SchnorrParty2} = require('../dist/src');
const {expect} = require('chai');
const crypto = require('crypto');
const {schnorr} = require('@zilliqa-js/crypto');
const {exec} = require('child_process');

const P1_ENDPOINT = 'http://localhost:8000';

describe('Two-Party Schnorr signature tests', () => {
    let p1;
    let p2;
    let p2Share;

    before(async () => {
        p1 = exec('npm run start-p1-server');
        p2 = new SchnorrParty2(P1_ENDPOINT);
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await sleep(10000); // wait for server to launch
    });

    after(() => {
        p1.kill();
    });

    it('generate key', async () => {
        p2Share = await p2.generateKey();
        expect(p2Share).to.be.a('object');
        expect(p2Share.id).to.be.a('string');
    });

    it('sign a message', async () => {
        const msgHash = crypto.createHash('sha256').update('some message').digest();
        const signature = await p2.sign(msgHash, p2Share);
        expect(signature).to.be.an('object');
        // validate using external library
        const isValid = schnorr.verify(
            msgHash,
            {r: signature.e, s: signature.s},
            Buffer.from(p2Share.getPublicKey().encode('hex', true), 'hex'));
        expect(isValid).to.be.eq(true, 'Invalid signature');
    });
});
