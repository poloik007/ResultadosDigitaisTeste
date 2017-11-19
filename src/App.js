import React, { Component } from 'react';
import Search from './search';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="container">
          <Search />
        </div>
      </div>
    );
  }
}

export default App;
