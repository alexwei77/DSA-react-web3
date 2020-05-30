import React, { Component } from "react";
import logo from "../logo.png";
import Web3 from "web3";
import "./App.css";

const DSA = require("dsa-sdk");

class App extends Component {
  constructor(props) {
    super(props);
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
