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
    // Remaining
    // 1. render input box for vault id
    // 2. special drop down for swap eth-dai
    // 3. make the dynamic array (sybol can be the option but for address will need to convert to lower case remove quotes and then get the address)
    constructor(props) {
        super(props);
        this.state = {
			color: '#85f7ff',
	        buttonText: "Connect",
			name: "",
            shareholders: [{}],
			
		    operationConfig:{
                "borrow": ["compound", "aave", "maker"],
                "deposit": ["compound", "aave", "maker"],
                "payback": ["compound", "aave", "maker"],
                "withdraw": ["compound", "aave", "maker"],
                "openVault": ["compound", "aave", "maker"],
                "swap": ["oasis", "oneInch", "kyber", "curve"],
                "flashBorrow": ["instapool"],
                "flashPayback": ["instapool"]
            },
            operationSelected: "",
            protocolSelected: "",
            assetSelected: "",
            buyingAssetSelected: "",
            amountSelected: "",
            vaultIdSelected: "",
            isMaker: false,
            isSwap: false,
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

    async loadBlockchainData() { // in browser with react
	    const accounts = await this.state.web3.eth.getAccounts()
        this.setState({ account: accounts[0] })
        console.log(this.state.account);
        const dsa = new DSA(this.state.web3);
		this.setState({dsa});

        // Getting Your DSA Address
        var existingDSAAddress = await dsa.getAccounts(this.state.account);
        console.log(existingDSAAddress)
        if (existingDSAAddress.length === 0) {
            var newDsaAddress = await dsa.build({
                gasPrice: this.state.web3.utils.toWei("29", "gwei")
            });
        }
		//change to this.state.account does this requires address as string?
        existingDSAAddress = await dsa.getAccounts("0xf88b0247e611eE5af8Cf98f5303769Cba8e7177C");
        console.log(existingDSAAddress)
        // Setting DSA Instance
        await dsa.setInstance(existingDSAAddress[0].id);
        // for testing
        let dai_address = dsa.to.kens.info.dai.address;
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
	
	handleOperationChange = evt => {
    this.setState({ operationSelected: evt.target.value });
    if (evt.target.value === 'swap') this.setState({ isSwap: true })
  };

  	handleProtocolChange = evt => {
    this.setState({ protocolSelected: evt.target.value });
    if (evt.target.value === 'maker') this.setState({ isMaker: true })
  };

    handleAssetChange = evt => {
    this.setState({ assetSelected: evt.target.value });
  };

  	handleBuyingAssetChange = evt => {
    this.setState({ buyingAssetSelected: evt.target.value });
  };

 	handleAmountChange = evt => {
    this.setState({ amountSelected: evt.target.value });
  };

  	handleVaultIdChange = evt => {
    this.setState({ vaultIdSelected: evt.target.value });
  };

  handleShareholderNameChange = idx => evt => {
    const newShareholders = this.state.shareholders.map((shareholder, sidx) => {
      if (idx !== sidx) return shareholder;
      return { ...shareholder, name: evt.target.value };
    });

    this.setState({ shareholders: newShareholders });
  };

  handleSubmit = evt => {
    console.log(this.state.shareholders)
    // const { name, shareholders } = this.state;
    // alert(`Incorporated: ${name} with ${shareholders.length} shareholders`);
  };

  handleAddShareholder = () => {
    this.setState({
      shareholders: this.state.shareholders.concat([{}])
    });
  };

  handleRemoveShareholder = idx => () => {
    this.setState({
      shareholders: this.state.shareholders.filter((s, sidx) => idx !== sidx)
    });
  };

    render() {
        let operatorOptions = Object.keys(this.state.operationConfig).map((operation, index) =>
                <option 
                    key={operation.index}
                    value={operation}
                >
                    {operation}
                </option>
        );
        const protocolList = this.state.operationConfig[this.state.operationSelected]
        let protocolOptions
        if (!protocolList) {
          protocolOptions = null
        } else {
         protocolOptions = this.state.operationConfig[this.state.operationSelected].map((protocol) => 
         <option 
                    key={protocol}
                    value={protocol}
                >
                    {protocol}
                </option>
        )
        }
      
        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div
          className="navbar-brand col-sm-3 col-md-2 mr-0">
          Custom
        </div>
		<button onClick = {this.login} style={{backgroundColor: this.state.color }}>{this.state.buttonText}</button>
      </nav>
	    // for operation with dsa pass dsa object from state while calling customrecipe function
            //dropdown loader
			<div>
			 <form onSubmit={this.handleSubmit}>
        {this.state.shareholders.map((shareholder, idx) => (
          <div >
            <select className="custom-search-select" onChange={this.handleOperationChange}>
            <option>Select Operation</option>
                {operatorOptions}
           </select>

            <select name="customSearch" className="custom-search-select" onChange={this.handleProtocolChange}>
            <option>Select Protocol</option>
                {protocolOptions}
           </select>
            <select className="custom-search-select" onChange={this.handleAssetChange}>
            <option>Select Depositing Asset</option>
            <option>ETH</option>
            <option>DAI</option>
            <option>USDC</option>
           </select>
            <input
              type="text"
              placeholder={`amount`}
              value={this.state.amountSelected}
              onChange={this.handleAmountChange}
            />
            {this.state.isSwap && <select className="custom-search-select" onChange={this.handleBuyingAssetChange}>
            <option>Select Buying Asset</option>
            <option>ETH</option>
            <option>DAI</option>
            <option>USDC</option>
           </select>}
             {this.state.isMaker && <input
              type="text"
              placeholder={`Vault Id`}
              value={this.state.vaultIdSelected}
              onChange={this.handleVaultIdChange}
            />}
            <button
              type="button"
              onClick={this.handleRemoveShareholder(idx)}
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={this.handleAddShareholder}
        >
          Add
        </button>
        <button>execute</button>
      </form>
	  </div>	
			</div>
        );
    }
}
export default App;
