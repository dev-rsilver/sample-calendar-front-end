import React, { Component } from 'react';
import produce from 'immer';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import DateSelector from '../components/DateSelector';

const styles = theme => ({
    eventInput: {
        minWidth: 375,
        marginBottom: 15
    },
    descriptionInput: {
        minWidth: 375,
        maxWidth: 375,
        marginBottom: 15
    },
    dateLabel: {
        minWidth: 100,
        minHeight: 50,
        maxWidth: 100,
        background: "#CCCCCC",
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        verticalAlign: "top",
        marginRight: 20

    },
    dateSelector: {
        display: "inline-block"
    }
});

class eventInformation extends Component {

    constructor(props) {
        super(props);

        var date = new Date();

        if(this.props.initialMonth !== undefined &&
           this.props.initialDay !== undefined &&
           this.props.initialYear !== undefined) {
               date = new Date(this.props.initialYear, this.props.initialMonth - 1, this.props.initialDay);
        }

        var currentDate = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " 12:00:00";

        this.state = {
            id: this.props.id,
            date: currentDate,
            title: this.props.initialTitle ? this.props.initialTitle : "",
            description: this.props.initialDescription ? this.props.initialDescription : ""
        }
    }

    notifyDateChanged = (month, day, year) => {
        var date = new Date(year, month - 1, day).getTime();
        if(isNaN(date)) {
            throw new Error("Invalid date.");
        }

        var dateStr = month + "/" + day + "/" + year + " 12:00:00";
        
        this.setState((state) => produce(state, draft => {
            draft.date = dateStr;
        }), () => {
            this.onEventDataChanged();
        });
    }

    onInput = (e) => {
        var id = e.target.id;
        var value = e.target.value;
        this.setState((state) => produce(state, draft => {
            draft[id] = value;
        }), () => {
            this.onEventDataChanged();
        });
    }

    /**
     * Fires when event data changes and provides notification of an event via a callback if the event's inputs
     * are completely filled.
     */
    onEventDataChanged = () => {
        if(this.state.title !== undefined && this.state.title.length > 0 && //title and date are required, description is optional
           this.state.date !== undefined && this.state.date.length > 0) {
               
            if(this.props.notifyEventChanged !== undefined) {
                if(typeof this.props.notifyEventChanged !== "function") {
                    throw new Error("notifyEventChanged must be a function.");
                }

                this.props.notifyEventChanged({
                    id: this.state.id,
                    title: this.state.title,
                    description: this.state.description,
                    date: this.state.date                    
                });
            }
           
        }

    }

    render() {

        //The following text fields show an example of using onInput in combination with an "id" to update the fields.

        return(
            <div>
                <div>
                    <TextField id="title" label="Event" className={this.props.classes.eventInput} value={this.state.title} onInput={this.onInput}></TextField>
                </div>
                <div>
                    <TextField id="description" label="Description" multiline className={this.props.classes.descriptionInput} value={this.state.description} onInput={this.onInput}></TextField>
                </div>
                <div>
                    <div className={this.props.classes.dateLabel}>Start</div>
                    <div className={this.props.classes.dateSelector}>
                        <DateSelector notifyDateChanged={this.notifyDateChanged} 
                                      initialMonth={this.props.initialMonth}
                                      initialDay={this.props.initialDay}
                                      initialYear={this.props.initialYear} />
                    </div>
                </div>
            </div>
        )
    }

}


const StyledEventInformation = withStyles(styles)(eventInformation);

/**
 * Component to collect information about an event.
 * 
 * @param {number} id Property: The id of the event to be returned in the notifyEventChanged callback. Typically, id should be provided only if editing an existing event.
 * @param {string} initialTitle Property: Value for prefilling the title field
 * @param {string} initialDescription Property: Value for prefilling the description field
 * @param {number} initialMonth Property: Value for prefilling the month field. If initialMonth, initialDay, or initialYear is undefined, the date is set to the current date.
 * @param {number} initialDay Property: Value for prefilling the date field. If initialMonth, initialDay, or initialYear is undefined, the date is set to the current date.
 * @param {number} initialYear Property: Value for prefilling the year field. If initialMonth, initialDay, or initialYear is undefined, the date is set to the current date.
 * @param {function} notifyEventChanged Property: Callback in the form of function(event) which will be called when all necessary event information has been provided or modified.
 */
class EventInformation extends Component {

    render() {
        return <StyledEventInformation {...this.props} />
    }

}

export default EventInformation;