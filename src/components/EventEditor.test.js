import React from 'react';
import ReactDOM from 'react-dom';
import { EventEditor } from './EventEditor';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import theme from '../core/theme/theme';

var themeObj = createMuiTheme(theme);

/* As this is a demo application, this component has a minimal test. For more in depth testing examples, please
see Calendar.test.js and ColorSelector.test.js. */

it('renders without crashing', () => {
    const div = document.createElement('div');
    var component =  <MuiThemeProvider theme={themeObj}><EventEditor date={{month:12, day:1, year:2018}} open={false} /></MuiThemeProvider>;
    ReactDOM.render(component, div);
    ReactDOM.unmountComponentAtNode(div);
});