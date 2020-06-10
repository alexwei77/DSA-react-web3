import React, {Component} from "react";
import logo from "../logo.png";
import Web3 from "web3";
import {executeLongEth, executeShortDai, executeDebtSwap, executeLendingSwap} from "../dsa/index";
import {
    flashBorrow,
    flashPayback,
    genericDSAOperations,
    swap,
    getMaxAmount
} from "../dsa/utils";
import "./App.css";

const DSA = require("dsa-sdk");

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { // UseCases That would be displayed to the user on the first screen
            usecases: [
                "Long Eth", "Short Dai", "Debt Swap", "Lending Swap"
            ],
            // Usecase Mapping with the protocol options based on the usecase(NOTE -> We will include InstaPool as well for flash loans & so out of these the user can chose max upto two)
            // Additionaly before executing the transaction we will have to do extra validation for eg if user wants to go long on eth then compound is a mandatory protocol and he can choses either oasis/oneInch
            // NOTE -> For each Usecase it will be mandatory fot he user to choose exact 2
            useCaseProtocolObject: {
                "Long Eth": [
                    "oneInch", "oasis", "compound", "aave"
                ],
                "Short Dai": [
                    "oasis", "maker", "oneInch"
                ],
                "Debt Swap": [
                    "oasis", "compound", "oneInch", "aave"
                ],
                "Lending Swap": ["oasis", "compound", "oneInch"]
            },
            lendingProtocols: [
                "compound", "aave", "dydx"
            ],
            dexProtocols: ["oasis", "oneInch", "kyber", "curve"]
        };
    }

    async componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    async loadWeb3() {
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            this.setState({web3});
        } else if (window.web3) {
            const web3 = new Web3(window.web3.currentProvider);
            this.setState({web3});
        } else {
            window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
    }

    async loadBlockchainData() { // in nodejs
        const dsa = new DSA({web3: this.state.web3, mode: "node", privateKey: process.env.REACT_APP_KEY});

        // Getting Your DSA Address
        var existingDSAAddress = await dsa.getAccounts("0xf88b0247e611eE5af8Cf98f5303769Cba8e7177C");
        if (existingDSAAddress.length === 0) {
            var newDsaAddress = await dsa.build({
                gasPrice: this.state.web3.utils.toWei("29", "gwei")
            });
        }
        existingDSAAddress = await dsa.getAccounts("0xf88b0247e611eE5af8Cf98f5303769Cba8e7177C");
        // Setting DSA Instance
        await dsa.setInstance(existingDSAAddress[0].id);
        this.setState({dsa});
        // For Testing only while integration this will be user's input
        // this.executeCustomisedTransaction("Long Eth", ["oneInch", "compound"]);
        // Custom Array Sample
        // only acceptable assets for now are eth, dai & usdc
        // for testing
        let dai_address = dsa.tokens.info.dai.address;
        let eth_address = dsa.tokens.info.eth.address;
        this.customReciepeMaker([
            {
                "aave": [
                    {
                        "name": "deposit",
                        "asset": dai_address,
                        "amount": 20
                    }, {
                        "name": "borrow",
                        "asset": eth_address,
                        "amount": 20
                    }
                ]
            }
        ], this.state.web3, dsa)
    }

    async executeCustomisedTransaction(usecase, protocols) {
        switch (usecase) {
            case "Long Eth":
                if ((!protocols.includes("oneInch") && !protocols.includes("oasis")) || (protocols.includes("oneInch") && protocols.includes("oasis"))) 
                    throw new Error("Have to chosse either 1inch or oasis for Going Long on Eth");
                 else if ((!protocols.includes("aave") && !protocols.includes("compound")) || (protocols.includes("aave") && protocols.includes("compound"))) 
                    throw new Error("Have to chosse either aave or compound for Going Long on Eth");
                 else 
                    return await executeLongEth(protocols, this.state.web3, this.state.dsa);
                


            case "Short Dai":
                if ((!protocols.includes("oneInch") && !protocols.includes("oasis")) || (protocols.includes("oneInch") && protocols.includes("oasis"))) 
                    throw new Error("Have to chosse either 1inch or oasis for Going Short on DAI");
                 else 
                    return await executeShortDai(protocols, this.state.web3, this.state.dsa);
                


            case "Debt Swap":
                if ((!protocols.includes("oneInch") && !protocols.includes("oasis")) || (protocols.includes("oneInch") && protocols.includes("oasis"))) 
                    throw new Error("Have to chosse either 1inch or oasis for Debt Swap");
                 else if ((!protocols.includes("aave") && !protocols.includes("compound")) || (protocols.includes("aave") && protocols.includes("compound"))) 
                    throw new Error("Have to chosse either aave or compound for Debt Swap");
                 else 
                    return await executeDebtSwap(protocols, this.state.web3, this.state.dsa);
                


            case "Lending Swap":
                if ((!protocols.includes("oneInch") && !protocols.includes("oasis")) || (protocols.includes("oneInch") && protocols.includes("oasis"))) 
                    throw new Error("Have to chosse either 1inch or oasis for Lending Swap");
                 else 
                    return await executeLendingSwap(protocols, this.state.web3, this.state.dsa);
                


            default:
                throw new Error("Wrong Usecase Option");
        }
    }

    async customReciepeMaker(customProtocols, web3, dsa) {
        try {
            let spells = await dsa.Spell();
            for (let i = 0; i < customProtocols.length; i++) {
                const protocols = Object.keys(customProtocols[i])
                if (protocols[i] != "maker") { // since the spell structure for maker connectors is different from others
                    for (let j = 0; j < customProtocols[i][protocols[i]].length; j++) {
                        switch (customProtocols[i][protocols[i]][j].name) {
                            case "borrow":
                                if (!customProtocols[i][protocols[i]][j].amount) 
                                    throw new Error("Amount Mandatory for Borrow");
                                 else 
                                    spells = await genericDSAOperations(spells, protocols[i], "borrow", customProtocols[i][protocols[i]][j].asset, customProtocols[i][protocols[i]][j].amount);
                                
                                break;

                            case "deposit":
                                if (!customProtocols[i][protocols[i]][j].amount) 
                                    spells = await genericDSAOperations(spells, protocols[i], "deposit", customProtocols[i][protocols[i]][j].asset, await getMaxAmount(web3));
                                 else 
                                    spells = await genericDSAOperations(spells, protocols[i], "deposit", customProtocols[i][protocols[i]][j].asset, customProtocols[i][protocols[i]][j].amount);
                                
                                break;

                            case "withdraw":
                                if (!customProtocols[i][protocols[i]][j].amount) 
                                    throw new Error("Amount Mandatory for Withdraw");
                                 else 
                                    spells = await genericDSAOperations(spells, protocols[i], "withdraw", customProtocols[i][protocols[i]][j].asset, customProtocols[i][protocols[i]][j].amount);
                                
                                break;

                            case "payback":
                                if (!customProtocols[i][protocols[i]][j].amount) 
                                    spells = await genericDSAOperations(spells, protocols[i], "payback", customProtocols[i][protocols[i]][j].asset, await getMaxAmount(web3));
                                 else 
                                    spells = await genericDSAOperations(spells, protocols[i], "payback", customProtocols[i][protocols[i]][j].asset, customProtocols[i][protocols[i]][j].amount);
                                
                                break;

                            case "flashBorrow":
                                if (!customProtocols[i][protocols[i]][j].amount) 
                                    throw new Error("Amount Mandatory for Flash Borrow");
                                 else 
                                    spells = await flashBorrow(spells, customProtocols[i][protocols[i]][j].asset, customProtocols[i][protocols[i]][j].amount);
                                
                                break;

                            case "flashPayback":
                                if (customProtocols[i][protocols[i]][j].amount) 
                                    throw new Error("Amount Not Required for Flash Payback");
                                 else 
                                    spells = await flashPayback(spells, customProtocols[i][protocols[i]][j].asset);      
                                
                                break;

                            case "swap":
                                const slippage = 2;
                                const swapDetail = await dsa.protocols[i].getBuyAmount(customProtocols[i][protocols[i]][j].buyingTokenSymbol, customProtocols[i][protocols[i]][j].sellingTokenSymbol, customProtocols[i][protocols[i]][j].amount, slippage);
                                spells = await swap(spells, protocols[i], customProtocols[i][protocols[i]][j].buyAddress, customProtocols[i][protocols[i]][j].sellAddress, customProtocols[i][protocols[i]][j].amount, swapDetail.unitAmt);
                                break;

                            default:
                                throw new Error("Invalid Operation");
                        }
                    }
                }
            }
            var data = {
                spells: spells
            };
            console.log(data)
            // For Simulation Testing on tenderly
            var gasLimit = await dsa.estimateCastGas(data).catch((err) => {
                return console.log(err);
            });
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        return (
            <div>
                <h1>test</h1>
            </div>
        );
    }
}
export default App;

