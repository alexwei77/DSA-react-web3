import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";

class Home extends Component {

  render() {
    return (
      <div id="container">
	  <div className="content">
      <h1>DSA-CUSTOMISER</h1>
      <h3>Easy to use custom DeFi dashboard</h3>
<Link to='/custom'><button type="submit" id="btn">Try Customiser</button></Link>
</div>
</div>
    );
  }
}

export default Home;