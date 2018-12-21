import React from 'react';
import ReactDOM from 'react-dom';
import ColorSelector from './ColorSelector';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import theme from '../core/theme/theme';

import ReactTestUtils from 'react-dom/test-utils';

var themeObj = createMuiTheme(theme);

/* Sample tests follow. In particular, the 'selects a color' test demonstrates simulating a DOM event for testing purposes.
In a production application, tests could be more comprehensive. */

it('renders without crashing', () => {
    const div = document.createElement('div');
    var component =  <MuiThemeProvider theme={themeObj}><ColorSelector colors={["#000000"]} /></MuiThemeProvider>;
    ReactDOM.render(component, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('selects a color', () => {
    const div = document.createElement('div');

    var colors = ["#000000", "#0AB0DE", "#AA00EE"];

    //This test checks that the onColorSelected callback is fired as a result of selecting a color
    //by simulating clicks on the various colors.

    var colorsSelected = 0;

    var component = <MuiThemeProvider theme={themeObj}>
                        <ColorSelector colors={colors} onColorSelected={(color) => { colorsSelected++; }} />
                    </MuiThemeProvider>;

    ReactDOM.render(component, div);

    //Find the colors.

    var selector = "div[style*='background']";

    var matches = div.querySelectorAll(selector);
    
    for(var i = 0; i < matches.length; i++) {
        ReactTestUtils.Simulate.click(matches[i]);
    }

    //Note: onColorSelected will fire once for the default color selection and then for each selected color.
    expect(colorsSelected).toEqual(matches.length + 1);

    ReactDOM.unmountComponentAtNode(div);
});

it('isHexadecimal validates hexadecimals', () => {
    const div = document.createElement('div');
    
    var methodsObject = {};

    var colors = ["#000000"];

    var component = <MuiThemeProvider theme={themeObj}>
                        <ColorSelector colors={colors} getMethods={ (methodsObj) => methodsObject = methodsObj } />
                    </MuiThemeProvider>;
    
    ReactDOM.render(component, div);

    expect(methodsObject.isHexadecimal("000000")).toEqual(true);
    expect(methodsObject.isHexadecimal("000AAC")).toEqual(true);
    expect(methodsObject.isHexadecimal("000AAR")).toEqual(false);
    expect(methodsObject.isHexadecimal("Z")).toEqual(false);
    expect(methodsObject.isHexadecimal("000000A")).toEqual(false);    
})