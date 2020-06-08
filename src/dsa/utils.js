export const flashBorrow = async (spells, assetAddress, amount) => {
    await spells.add({
        connector: "instapool",
        method: "flashBorrow",
        args: [assetAddress, amount, 0, 0]
    });
    return spells
}

export const flashPayback = async (spells, assetAddress) => {
    await spells.add({
        connector: "instapool",
        method: "flashPayback",
        args: [assetAddress, 0, 0]
    });
    return spells
}

export const deposit = async (spells, protocol, assetAddress, amount) => {
    await spells.add({
        connector: protocol,
        method: "deposit",
        args: [assetAddress, amount, 0, 0,]
    });
    return spells
}

export const borrow = async (spells, protocol, assetAddress, amount) => {
    await spells.add({
        connector: protocol,
        method: "borrow",
        args: [assetAddress, amount, 0, 0]
    });
    return spells
}

export const payback = async (spells, protocol, assetAddress, amount) => {
    await spells.add({
        connector: protocol,
        method: "payback",
        args: [assetAddress, amount, 0, 0]
    });
    return spells
}

export const withdraw = async (spells, protocol, assetAddress, amount) => {
    await spells.add({
        connector: protocol,
        method: "withdraw",
        args: [assetAddress, amount, 0, 0]
    });
    return spells
}

export const swap = async (spells, protocol, method, buyAddress, sellAddress, knownAmount, derivedAmount) => {
    await spells.add({
        connector: "oneInch",
        method: method,
        args: [
            buyAddress,
            sellAddress,
            knownAmount,
            derivedAmount,
            0,
            0
        ]
    });
    return spells
}

export const getMaxAmount = async (web3) => {
    const BN = await web3.utils.BN;
    return new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935");
}
