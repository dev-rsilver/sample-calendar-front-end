import React from 'react';
import ReactDOM from 'react-dom';
import { UnauthorizedView } from './UnauthorizedView';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import theme from '../core/theme/theme';

var themeObj = createMuiTheme(theme);

/* As this is a demo application, this component has a minimal test. For more in depth testing examples, please
see Calendar.test.js and ColorSelector.test.js. */

it('renders without crashing', () => {
    const div = document.createElement('div');
    var component =  <MuiThemeProvider theme={themeObj}><UnauthorizedView /></MuiThemeProvider>;
    ReactDOM.render(component, div);
    ReactDOM.unmountComponentAtNode(div);
});