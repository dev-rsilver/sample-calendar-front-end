import React, { Component } from 'react';

import { Route, Switch } from 'react-router';

import './App.css';

import Index from './pages/index';


class App extends Component {
  render() {

    var pagesView = (
      <Switch>
        <Route exact path="/" component={Index}></Route>
      </Switch>
    );

    return (
      <div className="App">
        <header className="App-header">
          {pagesView}
        </header>
      </div>
    );
  }
}

export default App;
