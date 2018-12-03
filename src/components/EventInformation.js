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
            description: this.props.initialDescription ? this.props.initialDescription : "",
            errors: {
                title: {
                    error: ""
                }
            },
            dateError: false
        }

        if(this.props.hasValidationErrors !== undefined && typeof this.props.hasValidationErrors !== "function") {
            throw new Error("hasValidationErrors must be a function.");
        }
    }

    notifyDateChanged = (month, day, year) => {
        var date = new Date(year, month - 1, day).getTime();
        if(isNaN(date)) {
            throw new Error("Invalid date.");
        }

        var dateStr = month + "/" + day + "/" + year + " 12:00:00";
        
        this.setState((state) => produce(state, draft => {
            //Date is only received if it's valid, so if it's valid, clear any errors.
            draft.dateError = false;
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
        if(this.state.title !== undefined && this.state.title.length > 0 && //title and date are required and date must not currently have validation errors
           this.state.date !== undefined && this.state.date.length > 0 &&
           !this.state.dateError) {
               
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
        } else {
            if(this.props.hasValidationErrors) {
                this.props.hasValidationErrors();
            }
        }
    }

    componentDidUpdate(prevProps) {
        //If the component should show errors, validate.
        if(!prevProps.showErrors && this.props.showErrors) {
            var errors = this.requireField("title");
            if(errors > 0) {
                return;
            }
        }

    }

    /**
     * 
     * Returns (number) 1 if error, 0 if no error. Returned number can be used to aggregate errors.
     * 
     * Example usage:
     * var errors = 0;
     * errors += this.requireField("input1");
     * errors += this.requireField("input2");
     * if(errors > 0) { return; }
     * 
     * @param {*} id The name of a root-level variable in state that also has a corresponding entry in the form of [id]: { error: "" } in the state "errors" object.
     */
    requireField(id) {
        
        id = id.toLowerCase();

        var field = this.state[id];

        if(field === undefined || field.trim().length <= 0) {
            this.setState((state) => produce(state, draft => {
                draft.errors[id].error = "Required";
            }));
            return 1;
        } else {
            this.setState((state) => produce(state, draft => {
                draft.errors[id].error = "";
            }));
            return 0;
        }
    }

    dateHasValidationErrors = () => {
        this.setState((state) => produce(state, draft => {
            draft.dateError = true;
        }), () => { 
            if(this.props.hasValidationErrors) {
                //Notify that validation errors are present.
                this.props.hasValidationErrors();
            }
        });       
    }

    render() {

        //The following text fields show an example of using onInput in combination with an "id" to update the fields.

        return(
            <div>
                <div>
                    <TextField id="title" 
                               label="Event" 
                               className={this.props.classes.eventInput} 
                               value={this.state.title} 
                               onInput={this.onInput} 
                               error={this.state.errors.title.error.length > 0 } 
                               helperText={this.state.errors.title.error}>
                    </TextField>
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
                                      initialYear={this.props.initialYear}
                                      showErrors={this.props.showErrors}
                                      hasValidationErrors={this.dateHasValidationErrors} />
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
 * @param {bool} showErrors Property: Determines whether the component should display validation errors.
 * @param {function} hasValidationErrors Property: Callback in the form of function() that fires when the component has validation errors.
 */
class EventInformation extends Component {

    render() {
        return <StyledEventInformation {...this.props} />
    }

}

export default EventInformation;