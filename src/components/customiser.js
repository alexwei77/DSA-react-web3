import React, { Component } from "react";
import Web3 from "web3";
import Authereum from "authereum";
import Modal from "react-bootstrap/Modal";
import Web3Modal from "web3modal";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  flashBorrow,
  flashPayback,
  genericDSAOperations,
  swap,
  openMakerVault,
  makerGenericOperations,
  transferAsset,
  withdrawDai,
  depositDai
} from "../dsa/utils";
import {
  genericResolver,
  makerVaultResolver,
  makerDSRResolver,
  getBalances
} from "../dsa/resolvers";
import "./Customiser.css";
const DSA = require("dsa-sdk");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: "#85f7ff",
      buttonText: "Connect",
      initialtext1: "Select Asset",
      showError: false,
      showWarning: false,
      showSuccess: false,
      showResolver: false,
      showMakerResolver: false,
      showTokenResolver: false,
      errMessage: "",
      successMessage: "",
      resolverData: {},
      vaultStats: {},
      dsrStats: {},
      balances: {},
      shareholders: [{}],
      operationConfig: {
        borrow: ["compound", "aave", "maker", "dydx"],
        deposit: ["compound", "aave", "maker", "dydx"],
        payback: ["compound", "aave", "maker", "dydx"],
        withdraw: ["compound", "aave", "maker", "dydx"],
        openVault: ["maker"],
        swap: ["oasis", "oneInch", "kyber", "curve"],
        flashBorrow: ["instapool"],
        flashPayback: ["instapool"],
      },
      regexp: /^[0-9](\.[0-9]+)?$/,
      makerVaultOptions: {
        ETH: "ETH-A",
        USDC: "USDC-A",
      },
    };
  }

  async componentWillMount() {
    this.showWarningModal();
  }
  async loadWeb3() {
    const providerOptions = {
      /* See Provider Options Section */
      authereum: {
        package: Authereum, // required
      },
    };
    const web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: false, // optional
      providerOptions, // required
    });
    const provider = await web3Modal.connect();
    const web3 = new Web3(provider);
    this.setState({ web3 });
  }

  login = async () => {
    try {
      await this.loadWeb3();
      await this.loadBlockchainData();

      this.setState({ color: "#0ff279" });
      this.setState({ buttonText: "Connected" });
    } catch (err) {
      console.log(err);
      this.setState({ color: "#85f7ff" });
      this.setState({ buttonText: "Tryagain" });
    }
  };

  async loadBlockchainData() {
    // in browser with react
    const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    console.log(this.state.account);
    const dsa = new DSA(this.state.web3);
    console.log(dsa);
    this.setState({ dsa });

    // Getting Your DSA Address
    var existingDSAAddress = await dsa.getAccounts(this.state.account);
    console.log(existingDSAAddress);
    if (existingDSAAddress.length === 0) {
      var newDsaAddress = await dsa.build({
        gasPrice: this.state.web3.utils.toWei("29", "gwei"),
      });
    }
    // change to this.state.account does this requires address as string?
    existingDSAAddress = await dsa.getAccounts(this.state.account);
    console.log(existingDSAAddress);
    this.setState({ dsaAddress: existingDSAAddress[0].address });
    // Setting DSA Instance
    await dsa.setInstance(existingDSAAddress[0].id);
    // for testing
    let dai_address = dsa.tokens.info.dai.address;
    let eth_address = dsa.tokens.info.eth.address;
    // Custom Array Sample
    // this.customReciepeMaker(
    //   [
    //     {
    //       name: "swap",
    //       protocol: "kyber",
    //       // selling token
    //       asset: dai_address,
    //       buyingTokenSymbol: "ETH",
    //       sellingTokenSymbol: "DAI",
    //       buyAddress: eth_address,
    //       amount: 0.00002,
    //     }
    //   ],
    //   this.state.web3,
    //   this.state.dsa
    // );
  }

  async customReciepeMaker(customProtocols, web3, dsa) {
    try {
      let spells = await dsa.Spell();
      for (let i = 0; i < customProtocols.length; i++) {
        if (customProtocols[i].protocol != "maker") {
          // since the spell structure for maker connectors is different from others
          switch (customProtocols[i].name) {
            case "borrow":
              if (!customProtocols[i].amount)
                throw new Error("Amount Mandatory for Borrow");
              else
                spells = await genericDSAOperations(
                  spells,
                  customProtocols[i].protocol,
                  "borrow",
                  customProtocols[i].asset,
                  customProtocols[i].amount
                );

              break;

            case "deposit":
              if (!customProtocols[i].amount)
                spells = await genericDSAOperations(
                  spells,
                  customProtocols[i].protocol,
                  "deposit",
                  customProtocols[i].asset,
                  "-1"
                );
              else
                spells = await genericDSAOperations(
                  spells,
                  customProtocols[i].protocol,
                  "deposit",
                  customProtocols[i].asset,
                  customProtocols[i].amount
                );

              break;

            case "withdraw":
              if (!customProtocols[i].amount)
                throw new Error("Amount Mandatory for Withdraw");
              else
                spells = await genericDSAOperations(
                  spells,
                  customProtocols[i].protocol,
                  "withdraw",
                  customProtocols[i].asset,
                  customProtocols[i].amount
                );

              break;

            case "payback":
              if (!customProtocols[i].amount)
                spells = await genericDSAOperations(
                  spells,
                  customProtocols[i].protocol,
                  "payback",
                  customProtocols[i].asset,
                  "-1"
                );
              else
                spells = await genericDSAOperations(
                  spells,
                  customProtocols[i].protocol,
                  "payback",
                  customProtocols[i].asset,
                  customProtocols[i].amount
                );

              break;

            case "flashBorrow":
              if (!customProtocols[i].amount)
                throw new Error("Amount Mandatory for Flash Borrow");
              else
                spells = await flashBorrow(
                  spells,
                  customProtocols[i].asset,
                  customProtocols[i].amount
                );

              break;

            case "flashPayback":
                spells = await flashPayback(spells, customProtocols[i].asset)
              break;

            case "swap":
              if (customProtocols[i].buyingTokenSymbol === customProtocols[i].sellingTokenSymbol)
                throw new Error("Cannot have both assets same");
              
              if (!customProtocols[i].amount)
                throw new Error("Swap Amount is mandatory");
              const slippage = 2;
              const amount = web3.utils.fromWei(customProtocols[i].amount, 'ether')  
              const swapDetail = await dsa[customProtocols[i].protocol.toString()].getBuyAmount(
                customProtocols[i].buyingTokenSymbol,
                customProtocols[i].sellingTokenSymbol,
                amount,
                slippage
              );
              spells = await swap(
                spells,
                customProtocols[i].protocol,
                customProtocols[i].buyAddress,
                customProtocols[i].asset,
                customProtocols[i].amount,
                swapDetail.unitAmt
              );
              break;

            default:
              throw new Error("Invalid Operation");
          }
        } else {
          switch (customProtocols[i].name) {
            case "openVault":
              spells = await openMakerVault(
                spells,
                this.state.makerVaultOptions[
                  customProtocols[i].sellingTokenSymbol
                ]
              );
              break;

            case "deposit":
              if (!customProtocols[i].vaultId) customProtocols[i].vaultId = 0;

              spells = await makerGenericOperations(
                spells,
                "deposit",
                customProtocols[i].vaultId,
                customProtocols[i].amount
              );
              break;

            case "borrow":
              if (!customProtocols[i].vaultId) customProtocols[i].vaultId = 0;

              spells = await makerGenericOperations(
                spells,
                "borrow",
                customProtocols[i].vaultId,
                customProtocols[i].amount
              );
              break;

            case "payback":
              if (!customProtocols[i].vaultId) customProtocols[i].vaultId = 0;

              spells = await makerGenericOperations(
                spells,
                "payback",
                customProtocols[i].vaultId,
                customProtocols[i].amount
              );
              break;

            case "withdraw":
              if (!customProtocols[i].vaultId) customProtocols[i].vaultId = 0;

              spells = await makerGenericOperations(
                spells,
                "withdraw",
                customProtocols[i].vaultId,
                customProtocols[i].amount
              );
              break;

            default:
              throw new Error("Invalid Operation");
          }
        }
      }
      var data = {
        spells: spells,
      };
      console.log(data);
      // For Simulation Testing on tenderly
      var gasLimit = await dsa.estimateCastGas(data).catch((err) => {
        console.log(err);
        this.setState({
          errMessage: "Transaction is likely to fail, Check you spells once!",
        });
        this.showErrorModal();
      });
      console.log(gasLimit)
      const tx = await dsa.cast({spells: spells})
        .catch((err) => {
          this.setState({
            errMessage: "Transaction is likely to fail, Check you spells once!",
          });
          this.showErrorModal();
        });
      this.setState({
        successMessage: "https://etherscan.io/tx/" + tx,
      });
      this.showSuccessModal();
      
    } catch (err) {
          // console.log(err)
          this.setState({
            errMessage: err.message
          });
          this.showErrorModal();   
     }
  }

  handleOperationChange = (idx) => (evt) => {
    this.state.shareholders[idx].name = evt.target.value;
    this.setState({ shareholders: this.state.shareholders });
  };

  handleProtocolChange = (idx) => (evt) => {
    this.state.shareholders[idx].protocol = evt.target.value;
    this.setState({ shareholders: this.state.shareholders });
  };

  handleAssetChange = (idx) => (evt) => {
    try {
      const assetInstance = evt.target.value.toLowerCase()
      console.log(assetInstance)
      this.state.shareholders[idx].asset = this.state.dsa.tokens.info[
        assetInstance
      ].address;
      this.state.shareholders[idx].sellingTokenSymbol = evt.target.value;
      this.setState({ shareholders: this.state.shareholders });
    } catch (err) {
      this.setState({ errMessage: "Connect your Metamask Wallet Once!" });
      this.showErrorModal(evt);
    }
  };

  handleBuyingAssetChange = (idx) => (evt) => {
    try {
      const assetInstance = evt.target.value.toLowerCase()
      console.log(assetInstance)
      this.state.shareholders[idx].buyAddress = this.state.dsa.tokens.info[
        assetInstance
      ].address;
      this.state.shareholders[idx].buyingTokenSymbol = evt.target.value;
      this.setState({ shareholders: this.state.shareholders });
    } catch (err) {
      this.setState({ errMessage: "Connect your Metamask Wallet First" });
      this.showErrorModal(evt);
    }
  };

  handleTransferAssetChange = (evt) => {
    try {
      const asset = evt.target.value.toLowerCase()
      const assetname = evt.target.value.toUpperCase()
      this.setState({ transferAssetSymbol: asset });
      this.setState({ initialtext1: assetname });
    } catch (err) {
      this.setState({ errMessage: "Connect your Metamask Wallet First" });
      this.showErrorModal(evt);
    }
  };

  handleAmountChange = (idx) => (evt) => {
    try {
      this.state.shareholders[idx].amount = this.state.web3.utils.toWei(
        evt.target.value,
        "ether"
      );
      this.setState({ shareholders: this.state.shareholders });
    } catch (err) {
      this.setState({ errMessage: "Connect your Metamask Wallet First" });
      this.showErrorModal(evt);
    }
  };

  handleDepositAmountChange = (evt) => {
    try {
      const depositAmount = this.state.web3.utils.toWei(
        evt.target.value,
        "ether"
      );
      this.setState({ depositAmount: evt.target.value });
    } catch (err) {
      this.setState({ errMessage: "Connect your Metamask Wallet First" });
      this.showErrorModal(evt);
    }
  };

  handleVaultIdChange = (idx) => (evt) => {
    this.state.shareholders[idx].vaultId = evt.target.value;
    this.setState({ shareholders: this.state.shareholders });
  };

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.customReciepeMaker(
      this.state.shareholders,
      this.state.web3,
      this.state.dsa
    );
  };

  transferAssets = async (evt) => {
    try {
      evt.preventDefault();
      const result = await transferAsset(
        this.state.dsa,
        this.state.transferAssetSymbol,
        this.state.depositAmount
      );
      // for testing will change it soon
      this.setState({
        successMessage: "https://etherscan.io/tx/" + result,
      });
      this.showSuccessModal(evt);
    } catch (err) {
      this.setState({ errMessage: "Transaction Failed" });
      this.showErrorModal(evt);
    }
  };

  getUserPosition = (protocol) => async (evt) => {
    try {
      evt.preventDefault();
      const positionData = await genericResolver(
        this.state.dsa,
        protocol,
        this.state.dsaAddress
      );
      const filteredData = {};
      filteredData["eth"] = positionData["eth"];
      filteredData["dai"] = positionData["dai"];
      filteredData["usdc"] = positionData["usdc"];
      filteredData["liquidation"] = positionData["liquidation"];
      filteredData["status"] = positionData["status"];
      filteredData["totalBorrowInEth"] = positionData["totalBorrowInEth"];
      filteredData["totalSupplyInEth"] = positionData["totalSupplyInEth"];

      this.setState({ resolverData: filteredData });
      this.showResolverModal();
    } catch (err) {
      this.setState({ errMessage: "Please Connect your Wallet" });
      this.showErrorModal();
    }
  };

  getUserMakerPosition = async () => {
    try {
      let vaultStats = await makerVaultResolver(
        this.state.dsa,
        this.state.dsaAddress
      );
      const dsrStats = await makerDSRResolver(
        this.state.dsa,
        this.state.dsaAddress
      );
      this.setState({ vaultStats, dsrStats });
      this.showMakerResolverModal();
    } catch (err) {
      this.setState({ errMessage: "Please Connect your Wallet" });
      this.showErrorModal();
    }
  };

  getBalances = async () => {
    try {
     const balances = await getBalances(this.state.dsa, this.state.dsaAddress);
     console.log(balances)
     this.setState({balances})
     this.showBalanceResolverModal();
    } catch (err) {
      this.setState({ errMessage: "Please Connect your Wallet" });
      this.showErrorModal();
    }
  }

  handleAddShareholder = () => {
    this.setState({
      shareholders: this.state.shareholders.concat([{}]),
    });
  };

  handleRemoveShareholder = (idx) => () => {
    this.setState({
      shareholders: this.state.shareholders.filter((s, sidx) => idx !== sidx),
    });
  };

  showErrorModal = (e) => {
    this.setState({
      showError: true,
    });
  };

  hideErrorModal = (e) => {
    this.setState({
      showError: false,
    });
  };

  showWarningModal = (e) => {
    this.setState({
      showWarning: true,
    });
  };

  hideWarningModal = (e) => {
    this.setState({
      showWarning: false,
    });
  };

  showSuccessModal = (e) => {
    this.setState({
      showSuccess: true,
    });
  };

  hideSuccessModal = (e) => {
    this.setState({
      showSuccess: false,
    });
  };

  showResolverModal = (e) => {
    this.setState({
      showResolver: true,
    });
  };

  hideResolverModal = (e) => {
    this.setState({
      showResolver: false,
    });
  };

  showMakerResolverModal = (e) => {
    this.setState({
      showMakerResolver: true,
    });
  };

  hideMakerResolverModal = (e) => {
    this.setState({
      showMakerResolver: false,
    });
  };

  showBalanceResolverModal = (e) => {
    this.setState({
      showBalanceResolverModal: true,
    });
  };

  hideBalanceResolverModal = (e) => {
    this.setState({
      showBalanceResolverModal: false,
    });
  };

  render() {
    const resolverNonObjectOptions = [
      "liquidation",
      "status",
      "totalBorrowInEth",
      "totalSupplyInEth",
    ];
    const userRelatedResolverOptions = ["supply", "borrow"];
    let operatorOptions = Object.keys(this.state.operationConfig).map(
      (operation, index) => (
        <option key={operation.index} value={operation}>
          {operation}{" "}
        </option>
      )
    );
    const protocolList = this.state.operationConfig[
      this.state.operationSelected
    ];
    let protocolOptions;
    if (!protocolList) {
      protocolOptions = null;
    } else {
      protocolOptions = this.state.operationConfig[
        this.state.operationSelected
      ].map((protocol) => (
        <option key={protocol} value={protocol}>
          {protocol}{" "}
        </option>
      ));
    }

    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <div className="navbar-brand col-sm-3 col-md-2 mr-0">Dashboard</div>
          <button
            onClick={this.login}
            style={{
              backgroundColor: this.state.color,
              borderRadius: "7px",
              border: "None",
            }}
          >
            {this.state.buttonText}{" "}
          </button>
        </nav>
        <div id="container">
          <div className="content">
            <div className="container1">
              <div className="box1">
                <div className="box3">
                  <div className="card card-3">
                    <Modal
                      show={this.state.showBalanceResolverModal}
                      onHide={this.hideBalanceResolverModal}
                    >
                      <Modal.Header>
                        <Modal.Title>Your Balances</Modal.Title>
                      </Modal.Header>
                      {Object.keys(this.state.balances).map((balance) => <Modal.Body> {balance} => {this.state.balances[balance]}</Modal.Body>)}
                      <Modal.Footer>
                        <button onClick={this.hideBalanceResolverModal}>Cancel</button>
                      </Modal.Footer>{" "}
                    </Modal>
                    <Modal
                      show={this.state.showMakerResolver}
                      onHide={this.hideMakerResolverModal}
                    >
                      <Modal.Title>Your Vault Positions</Modal.Title>
                      {Object.keys(this.state.vaultStats).map((vault) => (
                        <Modal.Body>
                          <b>{vault}</b>{" "}
                          {Object.keys(this.state.vaultStats[vault]).map(
                            (info) => (
                              <p>
                                {" "}
                                {info} => {this.state.vaultStats[vault][info]}
                              </p>
                            )
                          )}{" "}
                        </Modal.Body>
                      ))}
                      <br></br>
                      <Modal.Title>Your DSR Position</Modal.Title>
                      {Object.keys(this.state.dsrStats).map((properties) => (
                        <Modal.Body>
                          <b>{properties}</b> =>{" "}
                          {this.state.dsrStats[properties]}
                        </Modal.Body>
                      ))}
                      <Modal.Footer>
                        <button onClick={this.hideMakerResolverModal}>
                          Cancel
                        </button>
                      </Modal.Footer>{" "}
                    </Modal>
                    <Modal
                      show={this.state.showResolver}
                      onHide={this.hideResolverModal}
                    >
                      <Modal.Header>
                        <Modal.Title>Your Position</Modal.Title>
                      </Modal.Header>
                      {Object.keys(this.state.resolverData).map((asset) =>
                        !resolverNonObjectOptions.includes(asset) ? (
                          <Modal.Body>
                            <b>{asset}</b>{" "}
                            {Object.keys(this.state.resolverData[asset]).map(
                              (info) =>
                                userRelatedResolverOptions.includes(info) ? (
                                  <p>
                                    {info} =>{" "}
                                    {this.state.resolverData[asset][info]}
                                  </p>
                                ) : (
                                  <p></p>
                                )
                            )}{" "}
                          </Modal.Body>
                        ) : (
                          <Modal.Body>
                            <b>{asset}</b> => {this.state.resolverData[asset]}
                          </Modal.Body>
                        )
                      )}
                      <Modal.Footer>
                        <button onClick={this.hideResolverModal}>Cancel</button>
                      </Modal.Footer>{" "}
                    </Modal>
                    <Modal
                      show={this.state.showSuccess}
                      onHide={this.hideSuccessModal}
                    >
                      <Modal.Header>
                        <Modal.Title>Successful Transaction</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <a href={this.state.successMessage}>
                          Check Transaction
                        </a>
                      </Modal.Body>
                      <Modal.Footer>
                        <button onClick={this.hideSuccessModal}>Cancel</button>
                      </Modal.Footer>{" "}
                    </Modal>
                    <Modal
                      show={this.state.showWarning}
                      onHide={this.hideWarningModal}
                    >
                      <Modal.Header>
                        <Modal.Title>Warning</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        Before creating your recipies make sure sure to Connect
                        to your Wallet
                      </Modal.Body>
                      <Modal.Body>
                        Make Sure the Asset that you will be using in your
                        spells is available in your dsa, if not you can transfer
                      </Modal.Body>
                      <Modal.Footer>
                        <button onClick={this.hideWarningModal}>Cancel</button>
                      </Modal.Footer>{" "}
                    </Modal>
                    <Modal
                      show={this.state.showError}
                      onHide={this.hideErrorModal}
                    >
                      <Modal.Header>
                        <Modal.Title>Error</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>{this.state.errMessage}</Modal.Body>
                      <Modal.Footer>
                        <button onClick={this.hideErrorModal}>Cancel</button>
                      </Modal.Footer>{" "}
                    </Modal>
                    <div className="box4">
                        <form>
                          <div>
                            <div className="box6">
                              <div className="custom-select2">
                                <label className="new-label select-1">
                                  <span>{this.state.initialtext1}</span>
                                </label>
                                <select
                                  className="new-select"
                                  onChange={this.handleTransferAssetChange}
                                >
                                  <option>Select Asset</option>
                                  <option>ETH</option>
                                  <option>DAI</option>
                                  <option>USDC</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div>
                            <input
                              type="number"
                              onChange={this.handleDepositAmountChange}
                              placeholder={`Amount`}
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={this.transferAssets}
                              className="new-button1 shadow animate green"
                            >
                              Deposit
                            </button>
                          </div>
                        </form>
                    </div>
                  </div>
                </div>
                <div className="box3">
                  <div className="card card-4">
                    <div className="box5">
                    <div>
                        <button
                          type="button"
                          className="new-button2 shadow animate red"
                          onClick={this.getBalances}
                        >
                          Tokens
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="new-button2 shadow animate red"
                          onClick={this.getUserPosition("aave")}
                        >
                          Aave
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="new-button2 shadow animate red"
                          onClick={this.getUserMakerPosition}
                        >
                          Maker
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="new-button2 shadow animate red"
                          onClick={this.getUserPosition("compound")}
                        >
                          Compound
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="new-button2 shadow animate red"
                          onClick={this.getUserPosition("dydx")}
                        >
                          DyDx
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box2">
                <div class="gridcontainer">
                  <div class="gridbody">
                    <div class="gridcontent">
                      <div className="box3">
                        <form>
                          {" "}
                          {this.state.shareholders.map((shareholder, idx) => (
                            <div>
							<div className="custom-select">
                                <label className="label select-1">
                                  <span>{shareholder.name}</span>
                                </label>
                              <select
                                className="select"
                                onChange={this.handleOperationChange(idx)}
                              >
                                <option value="" selected disabled>
                                  Select Operation
                                </option>
                                {operatorOptions}{" "}
                              </select>
							  </div>
							  <div className="custom-select">
                                <label className="label select-1">
                                  <span>{shareholder.name}</span>
                                </label>
                              <select
                                className="select"
                                onChange={this.handleProtocolChange(idx)}
                              >
                                <option value="" selected disabled>
                                  Select Protocol
                                </option>
                                {shareholder.name &&
                                  this.state.operationConfig[
                                    shareholder.name
                                  ].map((protocol) => (
                                    <option value={protocol}>{protocol}</option>
                                  ))}{" "}
                              </select>
							  </div>
                              {shareholder.protocol == "maker" && (
							  <div className="custom-select">
                                <label className="label select-1">
                                  <span>{this.state.initialtext1}</span>
                                </label>
                                <select
                                  className="select"
                                  onChange={this.handleAssetChange(idx)}
                                >
                                  <option value="" selected disabled>
                                    Select Asset
                                  </option>
                                  {shareholder.name != "openVault" &&
                                    shareholder.name != "withdraw" && (
                                      <option>DAI</option>
                                    )}
                                  {shareholder.name != "payback" &&
                                    shareholder.name != "borrow" && (
                                      <option>ETH</option>
                                    )}
                                  {shareholder.name != "payback" &&
                                    shareholder.name != "borrow" && (
                                      <option>USDC</option>
                                    )}
                                </select>
								</div>
                              )}
                              {shareholder.protocol != "maker" && (
							  <div className="custom-select">
                                <label className="label select-1">
                                  <span>{this.state.initialtext1}</span>
                                </label>
                                <select
                                  className="select"
                                  onChange={this.handleAssetChange(idx)}
                                >
                                  <option value="" selected disabled>
                                    Select Asset
                                  </option>
                                  <option>DAI</option>
                                  <option>ETH</option>
                                  <option>USDC</option>
                                </select>
								</div>
                              )}
                              {shareholder.name != "flashPayback" && shareholder.name != "openVault" && <input
							    className="input2"
                                type="number"
                                placeholder={`Amount`}
                                onChange={this.handleAmountChange(idx)}
                              />}{" "}
                              {shareholder.name == "swap" && (
							  <div className="custom-select">
                                <label className="label select-1">
                                  <span>{this.state.initialtext1}</span>
                                </label>
                                <select
                                  className="select"
                                  onChange={this.handleBuyingAssetChange(idx)}
                                >
                                  <option value="" selected disabled>
                                    Select Buying Asset
                                  </option>
                                  <option>ETH</option>
                                  <option>DAI</option>
                                  <option>USDC</option>
                                </select>
								</div>
                              )}
                              {shareholder.protocol == "maker" &&
                                shareholder.name != "openVault" && (
                                  <input className="input2"
                                    type="number"
                                    placeholder={`Vault Id`}
                                    onChange={this.handleVaultIdChange(idx)}
                                  />
                                )}
                              <button
                                type="button"
                                onClick={this.handleRemoveShareholder(idx)}
                                className="new-button3 shadow animate red2"
                              >
                                -
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="action-button shadow animate yellow"
                            onClick={this.handleAddShareholder}
                          >
                            Add Block
                          </button>
                          <button
                            type="button"
                            className="action-button shadow animate green"
                            onClick={this.handleSubmit}
                          >
                            Execute
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
