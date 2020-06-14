import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {

  render() {
    return (
      <div>
      <h1>DSA</h1>
      <h3>easy to use custom defi dashboard</h3>
<Link to='/custom'><button type="submit" className="button">Try Customiser</button></Link>
</div>
    );
  }
}

export default Home;