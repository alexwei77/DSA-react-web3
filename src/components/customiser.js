import React, {Component} from "react";
import Web3 from "web3";
import {
    flashBorrow,
    flashPayback,
    genericDSAOperations,
    swap,
    openMakerVault,
    makerGenericOperations
} from "../dsa/utils";

const DSA = require("dsa-sdk");

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: "#85f7ff",
            buttonText: "Connect",
            shareholders: [
                {}
            ],

            operationConfig: {
                borrow: [
                    "compound", "aave", "maker", "dydx"
                ],
                deposit: [
                    "compound", "aave", "maker", "dydx"
                ],
                payback: [
                    "compound", "aave", "maker", "dydx"
                ],
                withdraw: [
                    "compound", "aave", "maker", "dydx"
                ],
                openVault: ["maker"],
                swap: [
                    "oasis", "oneInch", "kyber", "curve"
                ],
                flashBorrow: ["instapool"],
                flashPayback: ["instapool"]
            },
            regexp: /^[0-9\b]+$/,
            makerVaultOptions: {
                ETH: "ETH-A",
                USDC: "USDC-A"
            }
        };
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

    login = async () => {
        try {
            await this.loadWeb3();
            await this.loadBlockchainData();

            this.setState({color: "#0ff279"});
            this.setState({buttonText: "Connected"});
        } catch (err) {
            console.log(err)
            this.setState({color: "#85f7ff"});
            this.setState({buttonText: "Tryagain"});
        }
    };

    async loadBlockchainData() { // in browser with react
        const accounts = await this.state.web3.eth.getAccounts();
        this.setState({account: accounts[0]});
        console.log(this.state.account);
        const dsa = new DSA(this.state.web3);
        this.setState({dsa});

        // Getting Your DSA Address
        var existingDSAAddress = await dsa.getAccounts(this.state.account);
        console.log(existingDSAAddress);
        if (existingDSAAddress.length === 0) {
            var newDsaAddress = await dsa.build({
                gasPrice: this.state.web3.utils.toWei("29", "gwei")
            });
        }
        // change to this.state.account does this requires address as string?
        existingDSAAddress = await dsa.getAccounts("0xf88b0247e611eE5af8Cf98f5303769Cba8e7177C");
        console.log(existingDSAAddress);
        // Setting DSA Instance
        await dsa.setInstance(existingDSAAddress[0].id);
        // for testing
        let dai_address = dsa.tokens.info.dai.address;
        let eth_address = dsa.tokens.info.eth.address;
        // Custom Array Sample
        this.customReciepeMaker([
            {
                name: "deposit",
                protocol: "aave",
                asset: dai_address
            }, {
                name: "swap",
                protocol: "oasis",
                // selling token
                asset: dai_address,
                buyingTokenSymbol: "ETH",
                sellingTokenSymbol: "DAI",
                buyAddress: eth_address,
                amount: 20
            },
        ], this.state.web3, this.state.dsa);
    }


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
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "deposit", customProtocols[i].asset, "-1");
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
                                spells = await genericDSAOperations(spells, customProtocols[i].protocol, "payback", customProtocols[i].asset, "-1");
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
                            if (customProtocols[i].buyingTokenSymbol === customProtocols[i].sellingTokenSymbol) 
                                throw new Error("Cannot have both assets same");
                            
                            const slippage = 2;
                            // to remove quotes
                            const protocolInstance = customProtocols[i].protocol.replace(/['"]+/g, "");
                            const swapDetail = await dsa[protocolInstance].getBuyAmount(customProtocols[i].buyingTokenSymbol, customProtocols[i].sellingTokenSymbol, customProtocols[i].amount, slippage);
                            spells = await swap(spells, customProtocols[i].protocol, customProtocols[i].buyAddress, customProtocols[i].asset, customProtocols[i].amount, swapDetail.unitAmt);
                            break;

                        default:
                            throw new Error("Invalid Operation");
                    }
                } else {
                    switch (customProtocols[i].name) {
                        case "openVault":
                            spells = await openMakerVault(spells, this.state.makerVaultOptions[customProtocols[i].sellingTokenSymbol]);
                            break;

                        case "deposit":
                            if (!customProtocols[i].vaultId) 
                                customProtocols[i].vaultId = 0
                            spells = await makerGenericOperations(spells, "deposit", customProtocols[i].vaultId, customProtocols[i].amount);
                            break;

                        case "borrow":
                            if (!customProtocols[i].vaultId) 
                                customProtocols[i].vaultId = 0
                            spells = await makerGenericOperations(spells, "borrow", customProtocols[i].vaultId, customProtocols[i].amount);
                            break;

                        case "payback":
                            if (!customProtocols[i].vaultId) 
                                customProtocols[i].vaultId = 0
                            spells = await makerGenericOperations(spells, "payback", customProtocols[i].vaultId, customProtocols[i].amount);
                            break;

                        case "withdraw":
                            if (!customProtocols[i].vaultId) 
                                customProtocols[i].vaultId = 0
                            spells = await makerGenericOperations(spells, "withdraw", customProtocols[i].vaultId, customProtocols[i].amount);
                            break;

                        default:
                            throw new Error("Invalid Operation");
                    }
                }
            }
            console.log(spells)
            var data = {
                spells: spells
            };
            // For Simulation Testing on tenderly
            var gasLimit = await dsa.estimateCastGas(data).catch((err) => {
                return console.log(err);
            });
        } catch (err) {
            console.log(err);
        }
    }

    handleOperationChange = (idx) => (evt) => {
        this.state.shareholders[idx].name = evt.target.value;
        this.setState({shareholders: this.state.shareholders});
    };

    handleProtocolChange = (idx) => (evt) => {
        this.state.shareholders[idx].protocol = evt.target.value;
        this.setState({shareholders: this.state.shareholders});
    };

    handleAssetChange = (idx) => (evt) => {
        const assetInstance = evt.target.value.toLowerCase().replace(/['"]+/g, "");
        this.state.shareholders[idx].asset = this.state.dsa.tokens.info[assetInstance].address;
        this.state.shareholders[idx].sellingTokenSymbol = evt.target.value;
        this.setState({shareholders: this.state.shareholders});
    };

    handleBuyingAssetChange = (idx) => (evt) => {
        const assetInstance = evt.target.value.toLowerCase().replace(/['"]+/g, "");
        this.state.shareholders[idx].buyAddress = this.state.dsa.tokens.info[assetInstance].address;
        this.state.shareholders[idx].buyingTokenSymbol = evt.target.value;
        this.setState({shareholders: this.state.shareholders});
    };

    handleAmountChange = (idx) => (evt) => {
        if (this.state.regexp.test(evt.target.value)) {
            this.state.shareholders[idx].amount = this.state.web3.utils.toWei(evt.target.value, 'ether');
            this.setState({shareholders: this.state.shareholders});
        } else 
            throw new Error("Amount must be a number!");
        
    };

    handleVaultIdChange = (idx) => (evt) => {
        if (this.state.regexp.test(evt.target.value)) {
            this.state.shareholders[idx].vaultId = evt.target.value;
            this.setState({shareholders: this.state.shareholders});
        } else 
            throw new Error("Amount must be a number!");
        
    };

    handleSubmit = (evt) => {
        evt.preventDefault();
        this.customReciepeMaker(this.state.shareholders, this.state.web3, this.state.dsa);
    };

    handleAddShareholder = () => {
        this.setState({
            shareholders: this.state.shareholders.concat([{}])
        });
    };

    handleRemoveShareholder = (idx) => () => {
        this.setState({
            shareholders: this.state.shareholders.filter(
                (s, sidx) => idx !== sidx
            )
        });
    };

    render() {
        let operatorOptions = Object.keys(this.state.operationConfig).map((operation, index) => (
            <option key={
                    operation.index
                }
                value={operation}>
                {operation} </option>
        ));
        const protocolList = this.state.operationConfig[this.state.operationSelected];
        let protocolOptions;
        if (! protocolList) {
            protocolOptions = null;
        } else {
            protocolOptions = this.state.operationConfig[this.state.operationSelected].map((protocol) => (
                <option key={protocol}
                    value={protocol}>
                    {protocol} </option>
            ));
        }

        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <div className="navbar-brand col-sm-3 col-md-2 mr-0">Custom</div>
                    <button onClick={
                            this.login
                        }
                        style={
                            {backgroundColor: this.state.color}
                    }>
                        {
                        this.state.buttonText
                    } </button>
                </nav>
                // for operation with dsa pass dsa object from state while calling
                        customrecipe function //dropdown loader
                <div>
                    <form> {
                        this.state.shareholders.map((shareholder, idx) => (
                            <div>
                                <select className="custom-search-select"
                                    onChange={
                                        this.handleOperationChange(idx)
                                }>
                                    <option>Select Operation</option>
                                    {operatorOptions} </select>

                                <select className="custom-search-select"
                                    onChange={
                                        this.handleProtocolChange(idx)
                                }>
                                    <option>Select Protocol</option>
                                    {
                                    shareholder.name && this.state.operationConfig[shareholder.name].map((protocol) => <option value={protocol}>
                                        {protocol}</option>)
                                } </select>
                                {shareholder.protocol == "maker" && <select className="custom-search-select"
                                    onChange={
                                        this.handleAssetChange(idx)
                                }>
                                    <option>Select Depositing Asset</option>
                                    {shareholder.name != "openVault" && shareholder.name != "deposit" && shareholder.name != "withdraw" && <option>DAI</option>}
                                    {shareholder.name != "payback" && shareholder.name != "borrow" && <option>ETH</option>}
                                    {shareholder.name != "payback" && shareholder.name != "borrow" && <option>USDC</option>}
                                </select>}
                                {shareholder.protocol != "maker" && <select className="custom-search-select"
                                    onChange={
                                        this.handleAssetChange(idx)
                                }>
                                    <option>Select Depositing Asset</option>
                                    <option>DAI</option>
                                    <option>ETH</option>
                                    <option>USDC</option>
                                </select>}
                                <input type="text"
                                    placeholder={`amount`}
                                    onChange={
                                        this.handleAmountChange(idx)
                                    }/> {
                                shareholder.name == "swap" && (
                                    <select className="custom-search-select"
                                        onChange={
                                            this.handleBuyingAssetChange(idx)
                                    }>
                                        <option>Select Buying Asset</option>
                                        <option>ETH</option>
                                        <option>DAI</option>
                                        <option>USDC</option>
                                    </select>
                                )
                            }
                                {
                                shareholder.protocol == "maker" && shareholder.name != "openVault" && (
                                    <input type="text"
                                        placeholder={`Vault Id`}
                                        onChange={
                                            this.handleVaultIdChange(idx)
                                        }/>
                                )
                            }
                                <button type="button"
                                    onClick={
                                        this.handleRemoveShareholder(idx)
                                }>
                                    -
                                </button>
                            </div>
                        ))
                    }
                        <button type="button"
                            onClick={
                                this.handleAddShareholder
                        }>
                            Add
                        </button>
                        <button onClick={
                            this.handleSubmit
                        }>execute</button>
                    </form>
                </div>
            </div>
        );
    }
}
export default App;

