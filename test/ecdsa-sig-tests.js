const {EcdsaParty1, EcdsaParty2} = require('../dist/src');
const {expect} = require('chai');
const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const {exec} = require('child_process');

const P1_ENDPOINT = 'http://localhost:8000';

describe('Two-Party ECDSA tests', () => {
    let p1;
    let p2;
    let p2MasterKeyShare;

    before(async () => {
        p1 = exec('npm run start-p1-server');
        p2 = new EcdsaParty2(P1_ENDPOINT);
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await sleep(1000); // wait for server to launch
    });

    after(() => {
        p1.kill();
    });

    it('generate master key share', async () => {
        p2MasterKeyShare = await p2.generateMasterKey();
        expect(p2MasterKeyShare).to.be.a('object');
        expect(p2MasterKeyShare.id).to.be.a('string');
    }).timeout(10000);

    it('get child share', async () => {
        const p2ChildShare = p2.getChildShare(p2MasterKeyShare, 0, 0);
        expect(p2ChildShare).to.be.a('object');
        expect(p2ChildShare.id).to.be.a('string');
    });

    it('get child master key share should be deterministic', () => {
        const p2ChildShareFirst = p2.getChildShare(p2MasterKeyShare, 0, 0);
        const p2ChildShareSecond = p2.getChildShare(p2MasterKeyShare, 0, 0);
        expect(p2ChildShareFirst).to.deep.equal(p2ChildShareSecond);
    });

    it('get child public key of party2 should match child public key of party1', async () => {
        const p1 = new EcdsaParty1();
        const p1MasterKeyShare = await p1.getMasterKey(p2MasterKeyShare.id);
        const p1ChildShare = p1.getChildShare(p1MasterKeyShare, 0, 0);
        const p2ChildShare = p2.getChildShare(p2MasterKeyShare, 0, 0);
        expect(p1ChildShare.getPublicKey().encodeCompressed())
          .to.deep.equal(p2ChildShare.getPublicKey().encodeCompressed());
    });

    it('sign a message', async () => {
        const msgHash = crypto.createHash('sha256').update('some message').digest();
        const p2ChildShare = p2.getChildShare(p2MasterKeyShare, 0, 0);
        const signature = await p2.sign(msgHash, p2ChildShare, 0, 0);
        expect(signature).to.be.an('object');
        // validate using external library
        const isValid = ec.verify(
            msgHash,
            {r: signature.r, s: signature.s, recoveryParam: signature.recid},
            p2ChildShare.getPublicKey().encode('array', true));
        expect(isValid).to.be.eq(true, 'Invalid signature');
    });
});
