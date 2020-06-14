import React, { Component } from 'react';
import { Route ,Switch } from 'react-router-dom';
import Home from './Home.js';
import Customiser from './customiser.js';
import "./App.css";

class App extends Component {

  render() {
    return (
      <div>
        <Switch>
         <Route path='/' exact component={Home}/> 
         <Route path='/custom' exact component={customiser}/>        
         </Switch>
      </div>
      
    );
      }
}
export default App;