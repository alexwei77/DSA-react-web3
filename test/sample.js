const DSA = require("dsa-sdk");
const Web3 = require("web3");

async function loadBlockchainData() {
  const web3 = new Web3(
    new Web3.providers.HttpProvider("http://127.0.0.1:8545")
  );
  // in nodejs
  const dsa = new DSA({
    web3: web3,
    mode: "node",
    // mainnet forked dummy acct private key
    privateKey:
      "key",
  });

  var addr = await dsa.build({
    gasPrice: web3.utils.toHex(web3.utils.toWei("11", "gwei")),
  });
  // mainnet forked dummy account address
  addr = await dsa.getAccounts("0x024A2E2D632015d5a587F144A5C0F5DFC870ac2E");

  var BN = await web3.utils.BN;

  await dsa.setInstance(addr[0].id);

  let borrowAmount = 2; // 20 DAI
  let borrowAmtInWei = await dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

  let slippage = 2; // 2% slippage.
  let dai_address = await dsa.tokens.info.dai.address;
  let eth_address = await dsa.tokens.info.eth.address;

  let spells = await dsa.Spell();

  await spells.add({
    connector: "instapool",
    method: "flashBorrow",
    args: [dai_address, borrowAmtInWei, 0, 0],
  });

  let buyDetail = await dsa.oasis.getBuyAmount(
    "ETH",
    "DAI",
    borrowAmount,
    slippage
  );

  await spells.add({
    connector: "oasis",
    method: "sell",
    args: [eth_address, dai_address, borrowAmtInWei, buyDetail.unitAmt, 0, 0],
  });

  await spells.add({
    connector: "compound",
    method: "deposit",
    args: [
      eth_address,
      new BN(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
      0,
      0,
    ],
  });

  await spells.add({
    connector: "compound",
    method: "borrow",
    args: [dai_address, borrowAmtInWei, 0, 0],
  });

  await spells.add({
    connector: "instapool",
    method: "flashPayback",
    args: [dai_address, 0, 0],
  });

  // Point of execution of transaction
  try {
 await dsa
    .cast({
      spells: spells,
      gasPrice: web3.utils.toHex(web3.utils.toWei("110000", "gwei")),
    })
  } catch(err) {
    console.log(err)
  }
}

loadBlockchainData();
