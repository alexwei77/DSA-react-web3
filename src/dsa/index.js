import {
    flashBorrow,
    flashPayback,
    deposit,
    borrow,
    swap,
    payback,
    withdraw
} from './utils'

export const executeLongEth = async (protocols, web3, dsa) => {
    let borrowAmount = 20; // 20 DAI
    let borrowAmtInWei = await dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

    let slippage = 2; // 2% slippage.
    let dai_address = await dsa.tokens.info.dai.address;
    let eth_address = await dsa.tokens.info.eth.address;

    let spells = await dsa.Spell();
    spells = await flashBorrow(spells, dai_address, borrowAmtInWei)

    if (protocols.includes("oasis")) {
        let buyDetail = await dsa.oasis.getBuyAmount("ETH", "DAI", borrowAmount, slippage);

        spells = await swap(spells, "oasis", eth_address, dai_address, borrowAmtInWei, buyDetail.unitAmt)

    } else { // Other option is oneInch
        let buyDetail = await await dsa.oneInch.getBuyAmount("ETH", "DAI", borrowAmount, slippage);

        spells = await swap(spells, "oneInch", eth_address, dai_address, borrowAmtInWei, buyDetail.unitAmt)
    }
    if (protocols.includes("compound")) { // For Max Amt "-1" wasn't compatible
        var BN = await web3.utils.BN;
        spells = await deposit(spells, "compound", eth_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"))

        spells = await borrow(spells, "compound", dai_address, borrowAmtInWei)

    } else { // For Max Amt "-1" wasn't compatible
        var BN = await web3.utils.BN;
        spells = await deposit(spells, "aave", eth_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"))

        spells = await borrow(spells, "aave", dai_address, borrowAmtInWei)
    } spells = await flashPayback(spells, dai_address)

    var data = {
        spells: spells
    };

    // For Simulation Testing on tenderly
    var gasLimit = await await dsa.estimateCastGas(data).catch((err) => {
        return console.log(err);
    });
};

export const executeShortDai = async (protocols, web3, dsa) => {
    let borrowAmount = 20; // 20 DAI
    let borrowAmtInWei = await dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

    let slippage = 2; // 2% slippage.
    let dai_address = await dsa.tokens.info.dai.address;
    let usdc_address = await dsa.tokens.info.usdc.address;

    let spells = await dsa.Spell();

    spells = await flashBorrow(spells, dai_address, borrowAmtInWei)

    if (protocols.includes("oasis")) {
        let buyDetail = await dsa.oasis.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        spells = await swap(spells, "oasis", usdc_address, dai_address, borrowAmtInWei, buyDetail.unitAmt)

    } else {
        let buyDetail = await dsa.oneInch.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        spells = await swap(spells, "oneInch", usdc_address, dai_address, borrowAmtInWei, buyDetail.unitAmt)
    }

    await spells.add({connector: "maker", method: "open", args: ["USDC-A"]});
    var BN = await web3.utils.BN;

    await spells.add({
        connector: "maker",
        method: "deposit",
        args: [0, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0,]
    });

    await spells.add({
        connector: "maker",
        method: "borrow",
        args: [0, borrowAmtInWei, 0, 0]
    });

    spells = await flashPayback(spells, dai_address)


    var data = {
        spells: spells
    };
    // For Simulation Testing on tenderly
    var gasLimit = await dsa.estimateCastGas(data).catch((err) => {
        return console.log(err);
    });
};

export const executeDebtSwap = async (protocols, web3, dsa) => {
    let borrowAmount = 20; // 20 DAI
    let borrowAmtInWei = await dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

    let slippage = 2; // 0.1% slippage.
    let dai_address = await dsa.tokens.info.dai.address;
    let usdc_address = await dsa.tokens.info.usdc.address;

    let spells = await dsa.Spell();

    spells = await flashBorrow(spells, dai_address, borrowAmtInWei)

    if (protocols.includes("oasis")) {
        let buyDetail = await dsa.oasis.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        spells = await swap(spells, "oasis", usdc_address, dai_address, borrowAmtInWei, buyDetail.unitAmt)

    } else {
        let buyDetail = await dsa.oneInch.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        spells = await swap(spells, "oneInch", usdc_address, dai_address, borrowAmtInWei, buyDetail.unitAmt)
    }

    if (protocols.includes("compound")) {
        var BN = await web3.utils.BN;
        spells = await payback(spells, "compound", usdc_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"))

        spells = await borrow(spells, "compound", dai_address, borrowAmount)
    } else {

        var BN = await web3.utils.BN;
        spells = await payback(spells, "aave", usdc_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"))

        spells = await borrow(spells, "aave", dai_address, borrowAmount)

    } spells = await flashPayback(spells, dai_address)


    var data = {
        spells: spells
    };

    // For Simulation Testing on tenderly
    var gasLimit = await dsa.estimateCastGas(data).catch((err) => {
        return console.log(err);
    });
};

export const executeLendingSwap = async (protocols, web3, dsa) => {
    let withdrawAmount = 20; // 20 DAI
    let withdrawAmtInWei = dsa.tokens.fromDecimal(withdrawAmount, "dai"); // borrow flash loan and swap via Oasis

    let slippage = 2; // 0.1% slippage.
    let dai_address = await dsa.tokens.info.dai.address
    let usdc_address = await dsa.tokens.info.usdc.address

    let spells = await dsa.Spell();

    spells = await withdraw(spells, "compound", dai_address, withdrawAmtInWei)


    if (protocols.includes("oasis")) {
        let buyDetail = await dsa.oasis.getBuyAmount("USDC", "DAI", withdrawAmtInWei, slippage);

        spells = await swap(spells, "oasis", usdc_address, dai_address, withdrawAmtInWei, buyDetail.unitAmt)

    } else {

        let buyDetail = await dsa.oneInch.getBuyAmount("USDC", "DAI", withdrawAmtInWei, slippage);

        spells = await swap(spells, "oneInch", usdc_address, dai_address, withdrawAmtInWei, buyDetail.unitAmt)
    }

    var BN = await web3.utils.BN;
    spells = await deposit(spells, "compound", usdc_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"))


    var data = {
        spells: spells
    };

    // For Simulation Testing on tenderly
    var gasLimit = await dsa.estimateCastGas(data).catch((err) => {
        return console.log(err);
    });
}

