export const executeLongEth= async (protocols, web3, dsa) => {
        let borrowAmount = 20; // 20 DAI
        let borrowAmtInWei = dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

        let slippage = 2; // 2% slippage.
        let dai_address = dsa.tokens.info.dai.address;
        let eth_address = dsa.tokens.info.eth.address;

        let spells = dsa.Spell();

        await spells.add({
            connector: "instapool",
            method: "flashBorrow",
            args: [dai_address, borrowAmtInWei, 0, 0]
        });


        if (protocols.includes("oasis")) {
            let buyDetail = await dsa.oasis.getBuyAmount("ETH", "DAI", borrowAmount, slippage);

            await spells.add({
                connector: "oasis",
                method: "sell",
                args: [
                    eth_address,
                    dai_address,
                    borrowAmtInWei,
                    buyDetail.unitAmt,
                    0,
                    0,
                ]
            });
        } else { // Other option is oneInch
            let buyDetail = await dsa.oneInch.getBuyAmount("ETH", "DAI", borrowAmount, slippage);

            await spells.add({
                connector: "oneInch",
                method: "sell",
                args: [
                    eth_address,
                    dai_address,
                    borrowAmtInWei,
                    buyDetail.unitAmt,
                    0,
                    0,
                ]
            });
        }
        if (protocols.includes('compound')) {
           // For Max Amt "-1" wasn't compatible
        var BN = await web3.utils.BN;
        await spells.add({
            connector: "compound",
            method: "deposit",
            args: [eth_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0]
        });

        await spells.add({
            connector: "compound",
            method: "borrow",
            args: [dai_address, borrowAmtInWei, 0, 0]
        });
        } else {
                  // For Max Amt "-1" wasn't compatible
        var BN = await web3.utils.BN;
        await spells.add({
            connector: "aave",
            method: "deposit",
            args: [eth_address, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935"), 0, 0]
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

        console.log("executing")

        var data = {
            spells: spells
        };

        var gasLimit = await dsa.estimateCastGas(data).catch(err => {
            return console.log(err);
        });
        // const res = await dsa.cast({
        //     spells: spells,
        //     gasPrice: web3.utils.toWei("29", "gwei")
        // })
        // console.log(res)
    }

   