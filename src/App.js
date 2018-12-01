import React, { Component } from 'react';
import { Route, Switch } from 'react-router';

import produce from 'immer';

//Authentication
import { AuthenticationContext } from './core/api/authentication.js';
import { UnauthorizedView } from './components/UnauthorizedView.js';

//UI
import './App.css';
import theme from './core/theme/theme.js';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

//Pages
import Index from './pages/index';

var themeObj = createMuiTheme(theme);

class App extends Component {

  constructor(props) {
    super(props);
    
    var app = this;

    /**
     * App state is provided to other components via AuthenticationContext in render() below.
     */
    this.state = {
      authenticated: false,
      
      /**
       * JWT that will be utilized for communicating with data service.
       */
      token: undefined,

      /**
       * Sets JWT.
       * @param {*} token 
       */
      setToken: function(token) {
        app.saveTokenIntoLocalStorage(token);

        //Produce function used to create immutable state.
        app.setState((state) => produce(state, draft => {
          draft.token = token;
          draft.authenticated = true;
        }));
      },
      notifyTokenInvalid: function() {
        app.setState((state) => produce(state, draft => {
          draft.token = undefined;
          draft.authenticated = false;
        }));
      },
      signOut: function() {
        app.removeTokenFromLocalStorage();
        app.setState((state) => produce(state, draft => {
          draft.token = undefined;
          draft.authenticated = false;
        }));
      }      
    };
  }

  componentDidMount() {
    this.loadTokenFromLocalStorage();
  }

  saveTokenIntoLocalStorage(token) {
    localStorage.setItem("token", token);
  }

  removeTokenFromLocalStorage() {
    localStorage.removeItem("token");
  }

  loadTokenFromLocalStorage() {
    /* A token may be in storage but expired. Tokens are base64 encoded, so base64 decode the token and
       check if it's expired to determine whether to set the application to authenticated (otherwise the 
       user's next communication with the data service requiring a valid token would simply be denied). 
       If an API signout has occurred, that condition will not be detected until the next API request. */

       var token = localStorage.getItem("token");

       if(token !== null) {
         //A dot separates the header, payload and signature of the token
         var payloadString = token.split('.')[1];
         var payload = JSON.parse(atob(payloadString));
         
         var currentDate = new Date().getTime();
         var expirationDate = new Date(payload.expiration).getTime();

         if(currentDate > expirationDate) {
           //If the token is expired, remove it from localStorage.
           this.state.notifyTokenInvalid();
           localStorage.removeItem("token");
         } else {
           //Authenticated, but token may still be invalid (for instance, because it was invalidated on the
           //server). Whether it is invalid or not won't be known until the next API call.
           this.state.setToken(token);
         }     
       }
  }

  render() {

    var pagesView = (
      <Switch>
        <Route exact path="/" component={Index}></Route>
      </Switch>
    );

    if(!this.state.authenticated) {
      pagesView = <UnauthorizedView />;
    }

    return (
      <React.Fragment>
        <CssBaseline />
        <MuiThemeProvider theme={themeObj}>
          <AuthenticationContext.Provider value={this.state}>
            <div className="application">
              <div className="application-background">
                <AuthenticationContext.Consumer>
                  { value => { return pagesView }}
                </AuthenticationContext.Consumer>
              </div>
            </div>
          </AuthenticationContext.Provider>
        </MuiThemeProvider>
      </React.Fragment>
    );
  }
}

export default App;
