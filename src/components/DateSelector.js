import React, { Component } from 'react';
import produce from 'immer';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import Time from '../core/time';

const styles = theme => ({
    monthInput: {
        maxWidth: 150,
        marginRight: 10
    },
    dayInput: {
        maxWidth: 125,
        marginRight: 10
    },
    yearInput: {
        maxWidth: 75
    }
});

class dateSelector extends Component {

    constructor(props) {
        super(props);

        var date = new Date();

        this.state = {
            selectedMonth: date.getMonth() + 1,
            selectedDay: date.getDate(),
            selectedYear: date.getFullYear().toString()
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
        }));
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

        if(year === undefined) {
            throw new Error("Expected year");
        }

        if(isNaN(parseInt(year, 10))) {
            throw new Error("Expected year to be a number.");
        }

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
            <div>
                <TextField select label="Month" className={this.props.classes.monthInput} value={this.state.selectedMonth} onChange={this.onChange.bind(this, "selectedMonth")}>
                    {this.getMonthOptions()}
                </TextField>
                <TextField select label="Day" className={this.props.classes.dayInput} value={this.state.selectedDay} onChange={this.onChange.bind(this, "selectedDay")}>
                    {this.getDayOptions(this.state.selectedMonth, this.state.selectedYear)}
                </TextField>
                <TextField label="Year" className={this.props.classes.yearInput} value={this.state.selectedYear} onInput={this.onInput.bind(this, "selectedYear")}>
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
 */
class DateSelector extends Component {

    render() {
        return <StyledDateSelector {...this.props} />
    }

}

export default DateSelector;