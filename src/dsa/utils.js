export const flashBorrow = async (spells, assetAddress, amount) => {
    await spells.add({
        connector: "instapool",
        method: "flashBorrow",
        args: [assetAddress, amount, 0, 0]
    });
    return spells;
};

export const flashPayback = async (spells, assetAddress) => {
    await spells.add({
        connector: "instapool",
        method: "flashPayback",
        args: [assetAddress, 0, 0]
    });
    return spells;
};

export const genericDSAOperations = async (spells, protocol, method, assetAddress, amount) => {
    await spells.add({
        connector: protocol,
        method: method,
        args: [assetAddress, amount, 0, 0]
    });
    return spells;
}


export const swap = async (spells, protocol, buyAddress, sellAddress, knownAmount, derivedAmount) => {
    await spells.add({
        connector: protocol,
        method: "sell",
        args: [
            buyAddress,
            sellAddress,
            knownAmount,
            derivedAmount,
            0,
            0
        ]
    });
    return spells;
};

export const openMakerVault = async (spells, collateral) => { // Types ETH-A, BAT-A, USDC-A
    await spells.add({connector: "maker", method: "open", args: [collateral]});
    return spells
};

export const makerGenericOperations = async (spells, method, vaultId, amount) => {
     await spells.add({
        connector: "maker",
        method: method,
        args: [vaultId, amount, 0, 0]
    });
    return spells;
}

export const getMaxAmount = async (web3) => {
    const BN = await web3.utils.BN;
    return new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935");
};

