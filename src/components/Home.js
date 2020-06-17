import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";

class Home extends Component {

  render() {
    return (
      <div id="container">
	  <div className="content">
      <h1>DSA</h1>
      <h3>easy to use custom defi dashboard</h3>
<Link to='/custom'><button type="submit" id="btn">Try Customiser</button></Link>
</div>
</div>
    );
  }
}

export default Home;