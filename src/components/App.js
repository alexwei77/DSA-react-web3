import React, { Component } from "react";
import logo from "../logo.png";
import Web3 from "web3";
import "./App.css";

const DSA = require("dsa-sdk");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // UseCases That woul;d be displayed to the user on the first screen
      usecases: ['Long Eth', 'Short Dai', 'Debt Bridge', 'Lending Bridge', 'Debt Swap', 'Lending Swap'],
      // Usecase Mapping with the protocol options based on the usecase(NOTE -> We will include InstaPool as well for flash loans & so out of these the user can chose max upto two)
      // Additionaly before executing the transaction we will have to do extra validation for eg if user wants to go long on eth then compound is a mandatory protocol and he can choses either oasis/oneInch
      useCaseProtocolObject: {
       'Long Eth': ['oneInch', 'oasis', 'compound'],
       'Short Dai': ['oasis', 'maker', 'oneInch']
       'Debt Bridge': ['maker', 'compound', 'dydx']
       'Lending Bridge': ['maker', 'compound', 'dydx']
       'Debt Swap': ['oasis', 'compound', 'oneInch'],
       'Lending Swap': '[oasis', 'compound', 'oneInch']
      }
    }
  }

  async componentWillMount() {
    await this.loadBlockchainData();
  }
  async loadBlockchainData() {
    // Fork Mainnet With Ganache-Cli & use this rpc
    const web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545")
    );
    // in nodejs
    const dsa = new DSA({
      web3: web3,
      mode: "node",
      privateKey: PRIVATE_KEY,
    });
    // Genearting a DSA Address
    var addr = await dsa.build({
      gasPrice: web3.utils.toHex(web3.utils.toWei("11", "gwei")),
    });
    console.log(addr);

    // Getting Your DSA Address
    addr = await dsa.getAccounts("0x2Bd0772F0F2b4b21a3603812822D2124572c722D");
    console.log(addr);

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
