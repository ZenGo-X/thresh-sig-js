const { Party1 } = require('../dist/src');

async function getP1MasterKey () {
  const party1 = new Party1();
  console.log(await party1.getMasterKey('d346fa0a-0cba-4e6c-82dd-ee246deca432'));
}

getP1MasterKey();
