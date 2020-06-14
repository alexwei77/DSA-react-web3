import React, {Component} from "react";
import Web3 from "web3";
import {executeLongEth, executeShortDai, executeDebtSwap, executeLendingSwap} from "../dsa/index";
import {
    flashBorrow,
    flashPayback,
    genericDSAOperations,
    swap,
    getMaxAmount,
    openMakerVault,
    makerGenericOperations
} from "../dsa/utils";

const DSA = require("dsa-sdk");

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
			color: '#85f7ff',
	        buttonText: "Connect",
			
			// UseCases That would be displayed to the user on the first screen
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
            makerVaultOptions: {
                "eth": "ETH-A",
                "usdc": "USDC-A"
            },
            lendingProtocols: [
                "compound", "aave", "dydx"
            ],
            dexProtocols: ["oasis", "oneInch", "kyber", "curve"]
        };
    }
	
	async loadWeb3() {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
	  this.setState({ web3 })
    }
    else if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider)
	  this.setState({ web3 })
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    }

    login = async() => {
	try {
    await this.loadWeb3()
    await this.loadBlockchainData()

    let result2 = await this.state.lendingpool.methods.getUserAccountData("0x48c0d7f837fcad83e48e51e1563856fb1d898d01").call({ from: this.state.account });
    console.log(result2)

    let result1 = await this.state.lendingpool.methods.getUserReserveData("0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108","0x48c0d7f837fcad83e48e51e1563856fb1d898d01").call({ from: this.state.account })
    console.log(result1);
	
	this.setState({color: '#0ff279'});
	this.setState({buttonText:"Connected"});
	} catch(err) {
		this.setState({color: '#85f7ff'});
		this.setState({buttonText: "Tryagain"});
		}

    }

    async loadWeb3() {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
	  this.setState({ web3 })
    }
    else if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider)
	  this.setState({ web3 })
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    }

    async loadBlockchainData() { // in nodejs
        const dsa = new DSA(this.state.web3);
		this.setState({dsa});

        // Getting Your DSA Address
        var existingDSAAddress = await dsa.getAccounts("0xf88b0247e611eE5af8Cf98f5303769Cba8e7177C");
        console.log(existingDSAAddress)
        if (existingDSAAddress.length === 0) {
            var newDsaAddress = await dsa.build({
                gasPrice: this.state.web3.utils.toWei("29", "gwei")
            });
        }
        existingDSAAddress = await dsa.getAccounts("0xf88b0247e611eE5af8Cf98f5303769Cba8e7177C");
        console.log(existingDSAAddress)
        // Setting DSA Instance
        await dsa.setInstance(existingDSAAddress[0].id);
        // for testing
        let dai_address = dsa.tokens.info.dai.address;
        let eth_address = dsa.tokens.info.eth.address;
        // Custom Array Sample
        this.customReciepeMaker([
            {
                "name": "borrow",
                "protocol": "aave",
                "asset": dai_address,
                "amount": 20
            }, {
                "name": "swap",
                "protocol": "oasis",
                // selling token
                "asset": dai_address,
                "buyingTokenSymbol": "ETH",
                "sellingTokenSymbol": "DAI",
                "buyAddress": eth_address,
                "amount": 20
            }
        ], this.state.web3, this.state.dsa)
    }
    // Not Needed for now
    /*async executeCustomisedTransaction(usecase, protocols) {
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
    }*/

    async customReciepeMaker(customProtocols, web3, dsa) {
        try {
            let spells = await dsa.Spell();
            for (let i = 0; i < customProtocols.length; i++) {
                if (customProtocols[i].protocol != "maker") { // since the spell structure for maker connectors is different from others
                    switch (customProtocols[i].name) {
                        case "borrow":
                            if (!customProtocols[i].amount) 
                                throw new Error("Amount Mandatory for Borrow");
                             else 
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "borrow", customProtocols[i].asset, customProtocols[i].amount);
                            
                            break;

                        case "deposit":
                            if (!customProtocols[i].amount) 
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "deposit", customProtocols[i].asset, await getMaxAmount(web3));
                             else 
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "deposit", customProtocols[i].asset, customProtocols[i].amount);
                            

                            break;

                        case "withdraw":
                            if (!customProtocols[i].amount) 
                                throw new Error("Amount Mandatory for Withdraw");
                             else 
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "withdraw", customProtocols[i].asset, customProtocols[i].amount);
                            

                            break;

                        case "payback":
                            if (!customProtocols[i].amount) 
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "payback", customProtocols[i].asset, await getMaxAmount(web3));
                             else 
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "payback", customProtocols[i].asset, customProtocols[i].amount);
                            

                            break;

                        case "flashBorrow":
                            if (!customProtocols[i].amount) 
                                throw new Error("Amount Mandatory for Flash Borrow");
                             else 
                                spells = await flashBorrow(spells, customProtocols[i].asset, customProtocols[i].amount);
                            

                            break;

                        case "flashPayback":
                            if (customProtocols[i].amount) 
                                throw new Error("Amount Not Required for Flash Payback");
                             else 
                                spells = await flashPayback(spells, customProtocols[i].asset);
                            

                            break;

                        case "swap":
                            const slippage = 2;
                            // to remove quotes
                            const protocolInstance = customProtocols[i].protocol.replace(/['"]+/g, '');
                            const swapDetail = await dsa.oasis.getBuyAmount(customProtocols[i].buyingTokenSymbol, customProtocols[i].sellingTokenSymbol, customProtocols[i].amount, slippage);
                            spells = await swap(spells, customProtocols[i].protocol, customProtocols[i].buyAddress, customProtocols[i].asset, customProtocols[i].amount, swapDetail.unitAmt);
                            break;

                        default:
                            throw new Error("Invalid Operation");
                    }
                } else {
                    switch (customProtocols[i].name) {
                        case 'openVault': spells = await openMakerVault(spells, this.state.makerVaultOptions[customProtocols[i].asset]);
                            break;

                        case 'deposit':
                            if (!customProtocols[i].vaultId) 
                                throw new Error("Vault Id Mandatory");
                            
                            spells = await makerGenericOperations(spells, "deposit", customProtocols[i].vaultId, customProtocols[i].amount)
                            break

                        case 'borrow':
                            if (!customProtocols[i].vaultId) 
                                throw new Error("Vault Id Mandatory");
                            
                            spells = await makerGenericOperations(spells, "borrow", customProtocols[i].vaultId, customProtocols[i].amount)
                            break

                        case 'payback':
                            if (!customProtocols[i].vaultId) 
                                throw new Error("Vault Id Mandatory");
                            
                            spells = await makerGenericOperations(spells, "payback", customProtocols[i].vaultId, customProtocols[i].amount)
                            break

                        case 'withdraw':
                            if (!customProtocols[i].vaultId) 
                                throw new Error("Vault Id Mandatory");
                            
                            spells = await makerGenericOperations(spells, "withdraw", customProtocols[i].vaultId, customProtocols[i].amount)
                            break

                        default:
                            throw new Error("Invalid Operation");
                    }
                }
            }
            var data = {
                spells: spells
            };
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
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div
          className="navbar-brand col-sm-3 col-md-2 mr-0">
          Custom
        </div>
		<button onClick = {this.login} style={{backgroundColor: this.state.color }}>{this.state.buttonText}</button>
      </nav>
            </div>
        );
    }
}
export default App;

