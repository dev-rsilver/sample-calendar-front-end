import React, { Component } from 'react';
import produce from 'immer';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    colorSwatch: {
        width: 20,
        height: 20,
        display: "inline-block",
        margin: 3,
        cursor: "pointer"
    }
});

class colorSelector extends Component {

    constructor(props) {
        super(props);

        if(this.props.colors === undefined) {
            throw new Error("'colors' prop must be provided and must be an array of hexadecimal colors");
        }

        if(this.props.colors !== undefined) {
            //Validate provided colors.
            if(!Array.isArray(this.props.colors)) {
                throw new Error("colors must be an array.");
            }

            for(var i = 0; i < this.props.colors.length; i++) {
                if(!this.isHexadecimal(this.props.colors[i])) {
                    throw new Error("Invalid color: must be hexadecimal.");
                }
            }
        }
    
        this.state = {
            /**
             * Hexadecimal value of the selected color
             */
            selectedColor: this.props.colors[0]
        }

        //Notify the consuming component that the color has changed.
        if(this.props.onColorSelected) {
            this.props.onColorSelected(this.state.selectedColor);
        }

        if(this.props.onColorSelected !== undefined && typeof this.props.onColorSelected !== "function") {
            throw new Error("onColorSelected must be a function.");
        }

        //Methods for testing.
        if(props.getMethods) {
            props.getMethods({
                isHexadecimal: this.isHexadecimal.bind(this)
            });
        }
    }

    isHexadecimal = (color) => {
        
        color = color.toLowerCase();

        var errors = 0;

        //# is optional
        if(color.startsWith("#")) {
            color = color.slice(1, color.length);
        }
        
        if(color.length < 6 || color.length > 6) {
            errors++;
        }

        for(var i = 0; i < color.length; i++) {
            if(!["a", "b", "c", "d", "e", "f", 
                 "0", "1", "2", "3", "4", "5", 
                 "6", "7", "8", "9"].includes(color[i])) {
                errors++;
            }
        }

        if(errors <= 0) {
            return true;
        }
        
        return false;

    }

    hexadecimalsEqual = (color1, color2) => {
        color1 = color1.toLowerCase();
        color2 = color2.toLowerCase();

        if(!color1.startsWith("#")) {
            color1 = "#" + color1;
        }

        if(!color2.startsWith("#")) {
            color2 = "#" + color2;
        }

        if(color1 === color2) {
            return true;
        }

        return false;
    }

    selectColor = (color) => {
        this.setState((state) => produce(state, draft => {
            draft.selectedColor = color;
        }), () => {
            if(this.props.onColorSelected !== undefined) {
                this.props.onColorSelected(color);
            }
        });
    }


    render() {

        var swatches = [];

        //Generate swatches based on provided colors.
        if(this.props.colors !== undefined) {
            for(var i = 0; i < this.props.colors.length; i++) {
                
                var outlined = false;
                if(this.state.selectedColor !== undefined && this.hexadecimalsEqual(this.state.selectedColor.toLowerCase(), this.props.colors[i].toLowerCase())) {
                    outlined = true;
                }

                swatches.push(<div key={this.props.colors[i]}
                                   className={[this.props.classes.colorSwatch]}
                                   style={{ background: this.props.colors[i].startsWith("#") ? this.props.colors[i] : "#" + this.props.colors[i],
                                            border: outlined ? "3px solid black" : "none" }}
                                   onClick={this.selectColor.bind(this, this.props.colors[i])}>
                              </div>);
            }
        }


        return(
            <div>
                {swatches}
            </div>
        )
    }

}


const StyledColorSelector = withStyles(styles)(colorSelector);

/**
 * Component that provides for selecting a color from a predefined set of colors. Notifies the consuming
 * component via onColorSelected. Defaults to the first color of the colors property and notifies the
 * consuming component of the default selection.
 * 
 * @param {array} colors Property: An array of 6-digit hexadecimal colors.
 * @param {function} onColorSelected Property: A callback in the form of function(color) that is called when a color is selected
 * 
 * @param {function} getMethods A callback in the form of function(object) which provides an object containing methods that can be tested.
 */
class ColorSelector extends Component {

    render() {
        return <StyledColorSelector {...this.props} />
    }

}

export default ColorSelector;