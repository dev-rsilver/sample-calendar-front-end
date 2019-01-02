import React, { Component } from 'react';
import produce from 'immer';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import Time from '../core/time';

const margin = 10;

const styles = theme => ({
    controlDiv: {
        width: "100%"
    },
    monthInput: {
        width: "40%",
        marginRight: margin
    },
    dayInput: {
        width: "25%",
        marginRight: margin
    },
    yearInput: {
        width: `calc(35% - ${margin*2}px)`
    }
});

class dateSelector extends Component {

    constructor(props) {
        super(props);

        var date = new Date();

        this.state = {
            selectedMonth: date.getMonth() + 1,
            selectedDay: date.getDate(),
            selectedYear: date.getFullYear().toString(),
            errors: {
                selectedYear: {
                    error: ""
                }
            }
        }

        if(this.props.hasValidationErrors !== undefined && typeof this.props.hasValidationErrors !== "function") {
            throw new Error("hasValidationErrors must be a function.");
        }
    }

    componentDidMount() {
        var date = new Date();

        if(this.props.initialMonth !== undefined &&
           this.props.initialDay !== undefined &&
           this.props.initialYear !== undefined) {
            date = new Date(this.props.initialYear, this.props.initialMonth - 1, this.props.initialDay);
        }

        this.setState((state) => produce(state, draft => {
            draft.selectedMonth = date.getMonth() + 1;
            draft.selectedDay = date.getDate();
            draft.selectedYear = date.getFullYear().toString();
        }), () => {
            this.dataChanged(this.state.selectedMonth, this.state.selectedDay, this.state.selectedYear);
        });
    }

    componentDidUpdate(prevProps) {
        //If the component should show errors, validate.
        if(!prevProps.showErrors && this.props.showErrors) {
            this.validate("selectedYear", (value) => { 
                if(value === undefined || value.length <= 0) {
                    if(this.props.hasValidationErrors) {
                        this.props.hasValidationErrors();
                    }
                    return "Required";
                } else {
                    var date = Date.parse(this.state.selectedMonth + "/" + this.state.selectedDay + "/" + value);

                    if(isNaN(date)) {
                        if(this.props.hasValidationErrors) {
                            this.props.hasValidationErrors();
                        }
                        return "Invalid";
                    }
                }

                return "";
            });
        }

    }

    onChange = (id, e) => {
        var value = e.target.value;
        this.setState((state) => produce(state, draft => {
            draft[id] = value;
        }), () => {
            this.dataChanged(this.state.selectedMonth, this.state.selectedDay, this.state.selectedYear);
        });
    }

    onInput = (id, e) => {
        var value = e.target.value;
        
        if(id === "selectedYear") {
            
            //Try to set a date. A simple integer parse check is insufficient because, for example, "2018a" would pass.
            var date = new Date(value, 1).getTime();
            
            if(isNaN(date)) {
                this.setState((state) => produce(state, draft => {
                    draft.errors.selectedYear.error = "Invalid";
                }));

                return;

            } else {
                if(value.length <= 0) {
                    this.setState((state) => produce(state, draft => {
                        draft.errors.selectedYear.error = "Required";
                        if(this.props.hasValidationErrors) {
                            this.props.hasValidationErrors();
                        }
                    }));
                } else {
                    this.setState((state) => produce(state, draft => {
                        draft.errors.selectedYear.error = "";
                    }));
                }
            }
        } else {
            throw new Error("Field not supported.");
        }

        this.setState((state) => produce(state, draft => {
            draft[id] = value;
        }), () => {
            this.dataChanged(this.state.selectedMonth, this.state.selectedDay, this.state.selectedYear);            
        });

    }

    dataChanged = (month, day, year) => {
        if(this.props.notifyDateChanged !== undefined) {
            if(typeof this.props.notifyDateChanged !== "function") {
                throw new Error("notifyDateChanged must be a function.");
            }

            //Check if date is valid.
            var date = Date.parse(month + "/" + day + "/" + year);

            if(isNaN(date)) {
                return;
            }

            //Year may be invalid and still return a valid date, so check.
            if(year.length <= 0) {
                return;
            }

            if(month > 0 && day > 0 && year.length >= 4) {
                this.props.notifyDateChanged(month, day, year);
            }
        }
    }

    /**
     * Returns MenuItem options for the months of the year.
     */
    getMonthOptions = () => {
        var options = [];
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => {
            options.push(<MenuItem key={value} value={value}>{Time.getMonthName(value)}</MenuItem>);
            return options;
        });
        return options;
    }

    /**
     * 
     * Returns (number) 1 if error, 0 if no error. Returned number can be used to aggregate errors.
     * 
     * Example usage:
     * var errors = 0;
     * errors += this.validate("input1", (value) => { if(!isNaN(parseInt(value))) { return ""; } return "Invalid"; });
     * errors += this.validate("input2", (value) => { if(!isNaN(parseInt(value))) { return ""; } return "Invalid"; });
     * if(errors > 0) { return; }
     * 
     * @param {string} id The name of a root-level variable in state that also has a corresponding entry in the form of [id]: { error: "" } in the state "errors" object.
     * @param {function} validationFunction Function(value) that returns either an empty string or an error message.
     */
    validate(id, validationFunction) {

        var field = this.state[id];

        if(field !== undefined) {
            if(validationFunction === undefined || typeof validationFunction !== "function") {
                throw new Error("validationFunction must be defined and must be a function.");
            }

            var result = validationFunction.call(this, field);

            if(result === undefined) {
                throw new Error("validationFunction must return a result.");
            }

            if(typeof result !== "string") {
                throw new Error("validationFunction must return a string.");
            }

            this.setState((state) => produce(state, draft => {
                draft.errors[id].error = result;
            }), () => {
                if(result.length <= 0) {
                    //No error
                    return 0;
                }
                //Error
                return 1;
            });
        } else {
            throw new Error("Field not found.");
        }
    }

    /**
     * Returns MenuItem options for the days of a specific month.
     * @param {number} month Month should be a number between 1 (January) and 12 (December)
     * @param {number} year Year should be a number, four digits in length
     */
    getDayOptions = (month, year) => {

        if(month === undefined) {
            throw new Error("Expected month");
        }

        if(isNaN(parseInt(month, 10))) {
            throw new Error("Expected month to be a number.");
        }

        //Year may be invalid, in which case a generic number of days for the given month
        //will be utilized.        

        var daysInMonth = Time.getDaysInMonth(month, year);
        
        var options = [];
        for(var i = 0; i < daysInMonth; i++) {
            options.push(<MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>);
        }
        return options;
    }

    //The following fields show an example of using bind() to pass additional information to onChange/onInput event handlers. 

    render() {
        return(
            <div className={this.props.classes.controlDiv}>
                <TextField select label="Month" className={this.props.classes.monthInput} value={this.state.selectedMonth} onChange={this.onChange.bind(this, "selectedMonth")}>
                    {this.getMonthOptions()}
                </TextField>
                <TextField select label="Day" className={this.props.classes.dayInput} value={this.state.selectedDay} onChange={this.onChange.bind(this, "selectedDay")}>
                    {this.getDayOptions(this.state.selectedMonth, this.state.selectedYear)}
                </TextField>
                <TextField id="selectedYear"
                           label="Year" 
                           className={this.props.classes.yearInput} 
                           value={this.state.selectedYear} 
                           onInput={this.onInput.bind(this, "selectedYear")}
                           error={this.state.errors.selectedYear.error.length > 0 } 
                           helperText={this.state.errors.selectedYear.error}>
                </TextField>
            </div>
        )
    }

}


const StyledDateSelector = withStyles(styles)(dateSelector);

/**
 * A component for selecting dates. Parent component should pass a prop, notifyDateChanged(month, date, year), 
 * that this component calls when the date changes.
 * 
 * @param {function} notifyDateChanged Property: Callback in the form of function(month, date, year)
 * @param {number} initialMonth Property: The initial month to which the date is set. If initialMonth, initialDay, or initialYear is undefined, the date is set to the current date.
 * @param {number} initialDay Property: The initial day to which the date is set. If initialMonth, initialDay, or initialYear is undefined, the date is set to the current date.
 * @param {number} initialYear Property: The initial year to which the date is set. If initialMonth, initialDay, or initialYear is undefined, the date is set to the current date.
 * @param {boolean} showErrors Property: When toggled to true, causes validation. Note that validation also occurs regardless of this property.
 * @param {function} hasValidationErrors Property: Callback in the form of function() that fires when the component has validation errors.
 */
class DateSelector extends Component {

    render() {
        return <StyledDateSelector {...this.props} />
    }

}

export default DateSelector;