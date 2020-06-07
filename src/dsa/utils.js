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

export const swap = async (spells, protocol, sellAddress, buyAddress, sellAmount, buyAmount) => {
    await spells.add({
        connector: "oneInch",
        method: "sell",
        args: [
            sellAddress,
            buyAddress,
            sellAmount,
            buyAmount,
            0,
            0
        ]
    });
    return spells
}
