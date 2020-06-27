export const flashBorrow = async (spells, assetAddress, amount) => {
  await spells.add({
    connector: "instapool",
    method: "flashBorrow",
    args: [assetAddress, amount, 0, 0],
  });
  return spells;
};

export const flashPayback = async (spells, assetAddress) => {
  await spells.add({
    connector: "instapool",
    method: "flashPayback",
    args: [assetAddress, 0, 0],
  });
  return spells;
};

export const genericDSAOperations = async (
  spells,
  protocol,
  method,
  assetAddress,
  amount
) => {
  await spells.add({
    connector: protocol,
    method: method,
    args: [assetAddress, amount, 0, 0],
  });
  return spells;
};

export const swap = async (
  spells,
  protocol,
  buyAddress,
  sellAddress,
  knownAmount,
  derivedAmount
) => {
  await spells.add({
    connector: protocol,
    method: "sell",
    args: [buyAddress, sellAddress, knownAmount, derivedAmount, 0, 0],
  });
  return spells;
};

export const transferAsset = async (dsa, token, amount) => {
  return await dsa.transfer({
    token: token, // the token key to transfer
    amount: await dsa.tokens.fromDecimal(amount, token), // this helper changes the amount to decimal value
  });
};

export const openMakerVault = async (spells, collateral) => {
  // Types ETH-A, BAT-A, USDC-A
  await spells.add({ connector: "maker", method: "open", args: [collateral] });
  return spells;
};

export const withdrawDai = async (spells, amount) => {
  await spells.add({
    connector: "maker",
    method: "withdrawDai",
    args: [amount, 0, 0],
  });
  return spells;
};

export const depositDai = async (spells, amount) => {
  await spells.add({
    connector: "maker",
    method: "depositDai",
    args: [amount, 0, 0],
  });
  return spells;
};

export const makerGenericOperations = async (
  spells,
  method,
  vaultId,
  amount
) => {
  await spells.add({
    connector: "maker",
    method: method,
    args: [vaultId, amount, 0, 0],
  });
  return spells;
};
