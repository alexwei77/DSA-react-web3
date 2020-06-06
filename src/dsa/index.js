export const executeLongEth = async (protocols, web3, dsa) => {
    let borrowAmount = 20; // 20 DAI
    let borrowAmtInWei = await dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

    let slippage = 2; // 2% slippage.
    let dai_address = await dsa.tokens.info.dai.address;
    let eth_address = await dsa.tokens.info.eth.address;

    let spells = await dsa.Spell();

    await spells.add({
        connector: "instapool",
        method: "flashBorrow",
        args: [dai_address, borrowAmtInWei, 0, 0]
    });

    if (protocols.includes("oasis")) {
        let buyDetail = await await dsa.oasis.getBuyAmount("ETH", "DAI", borrowAmount, slippage);

        await spells.add({
            connector: "oasis",
            method: "sell",
            args: [
                eth_address,
                dai_address,
                borrowAmtInWei,
                buyDetail.unitAmt,
                0,
                0
            ]
        });
    } else { // Other option is oneInch
        let buyDetail = await await dsa.oneInch.getBuyAmount("ETH", "DAI", borrowAmount, slippage);

        await spells.add({
            connector: "oneInch",
            method: "sell",
            args: [
                eth_address,
                dai_address,
                borrowAmtInWei,
                buyDetail.unitAmt,
                0,
                0
            ]
        });
    }
    if (protocols.includes("compound")) { // For Max Amt "-1" wasn't compatible
        var BN = await web3.utils.BN;
        await spells.add({
            connector: "compound",
            method: "deposit",
            args: [eth_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0,]
        });

        await spells.add({
            connector: "compound",
            method: "borrow",
            args: [dai_address, borrowAmtInWei, 0, 0]
        });
    } else { // For Max Amt "-1" wasn't compatible
        var BN = await web3.utils.BN;
        await spells.add({
            connector: "aave",
            method: "deposit",
            args: [eth_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0,]
        });

        await spells.add({
            connector: "aave",
            method: "borrow",
            args: [dai_address, borrowAmtInWei, 0, 0]
        });
    }

    await spells.add({
        connector: "instapool",
        method: "flashPayback",
        args: [dai_address, 0, 0]
    });

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

    await spells.add({
        connector: "instapool",
        method: "flashBorrow",
        args: [dai_address, borrowAmtInWei, 0, 0]
    });
    if (protocols.includes("oasis")) {
        let buyAmount = await dsa.oasis.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        await spells.add({
            connector: "oasis",
            method: "sell",
            args: [
                usdc_address,
                dai_address,
                borrowAmtInWei,
                buyAmount.unitAmt,
                0,
                0,
            ]
        });
    } else {
        let buyAmount = await await dsa.oneInch.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        await spells.add({
            connector: "oneInch",
            method: "sell",
            args: [
                usdc_address,
                dai_address,
                borrowAmtInWei,
                buyAmount.unitAmt,
                0,
                0,
            ]
        });
    }

    await spells.add({connector: "maker", method: "open", args: ["USDC-A"]});
    var BN = await web3.utils.BN;

    await spells.add({
        connector: "maker",
        method: "deposit",
        args: [
            0, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0,
        ], // deposit all USDC
    });

    await spells.add({
        connector: "maker",
        method: "borrow",
        args: [0, borrowAmtInWei, 0, 0]
    });

    await spells.add({
        connector: "instapool",
        method: "flashPayback",
        args: [dai_address, 0, 0]
    });

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

    await spells.add({
        connector: "instapool",
        method: "flashBorrow",
        args: [dai_address, borrowAmtInWei, 0, 0]
    });
    if (protocols.includes("oasis")) {
        let buyAmount = await dsa.oasis.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        await spells.add({
            connector: "oasis",
            method: "sell",
            args: [
                usdc_address,
                dai_address,
                borrowAmtInWei,
                buyAmount.unitAmt,
                0,
                0,
            ]
        });
    } else {
        let buyAmount = await dsa.oneInch.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

        await spells.add({
            connector: "oneInch",
            method: "sell",
            args: [
                usdc_address,
                dai_address,
                borrowAmtInWei,
                buyAmount.unitAmt,
                0,
                0,
            ]
        });
    }

    if (protocols.includes("compound")) {
        var BN = await web3.utils.BN;

        await spells.add({
            connector: "compound",
            method: "payback",
            args: [usdc_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0]
        });

        await spells.add({
            connector: "compound",
            method: "borrow",
            args: [dai_address, borrowAmount, 0, 0]
        });
    } else {
        var BN = await web3.utils.BN;
        await spells.add({
            connector: "aave",
            method: "payback",
            args: [
                usdc_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0
            ], // get Payback amount with id 423
        });

        await spells.add({
            connector: "aave",
            method: "borrow",
            args: [dai_address, borrowAmount, 0, 0]
        });
    }

    await spells.add({
        connector: "instapool",
        method: "flashPayback",
        args: [dai_address, 0, 0]
    });

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

    let buyAmount = await dsa.oasis.getBuyAmount("USDC", "DAI", withdrawAmount, slippage);

    let spells = await dsa.Spell();

    await spells.add({
        connector: "compound",
        method: "withdraw",
        args: [dai_address, withdrawAmtInWei, 0, 0]
    });

    if (protocols.includes("oasis")) {
        let buyAmount = await dsa.oasis.getBuyAmount("USDC", "DAI", withdrawAmount, slippage);

        await spells.add({
            connector: "oasis",
            method: "sell",
            args: [
                usdc_address,
                dai_address,
                withdrawAmtInWei,
                buyAmount.unitAmt,
                0,
                0
            ] // setting USDC amount with id 423
        });

    } else {
        let buyAmount = await dsa.oneInch.getBuyAmount("USDC", "DAI", withdrawAmount, slippage);

        await spells.add({
            connector: "oneInch",
            method: "sell",
            args: [
                usdc_address,
                dai_address,
                withdrawAmtInWei,
                buyAmount.unitAmt,
                0,
                0
            ] // setting USDC amount with id 423
        });
    }


    var BN = await web3.utils.BN;

    await spells.add({
        connector: "compound",
        method: "deposit",
        args: [usdc_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0]
    });

    var data = {
        spells: spells
    };

    // For Simulation Testing on tenderly
    var gasLimit = await dsa.estimateCastGas(data).catch((err) => {
        return console.log(err);
    });
}

