import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';

import Button from '@material-ui/core/Button';

import Time from '../core/time';

import { ApiClient } from '../core/api/api';
import { AuthenticationContext } from '../core/api/authentication';
import EventInformation from '../components/EventInformation';
import DeleteDialogContent from '../components/DeleteDialogContent';

import produce from 'immer';

const styles = theme => ({
    newEventButton: {
        marginTop: 10
    },
    dialog: {
        width: "100%"
    },
    eventDisplay: {
        display: "inline-flex",
        maxWidth: 275,
        verticalAlign: "top",
        minHeight: 50,
        justifyContent: "center"
    },
    eventTitle: {
        fontWeight: "bolder",
        marginTop: 8
    },
    eventDescription: {
        fontSize: "0.85rem"
    },
    eventDeleteButton: {
        display: "inline-block",
        verticalAlign: "top",
        float: "right"
    },
    eventEditButton: {
        display: "inline-block",
        verticalAlign: "top",
        float: "right"
    },
    horizontalRule: {
        height: 1,
        borderBottom: "1px solid #CCCCCC",
        width: "100%",
        marginTop: 10,
        marginBottom: 10
    },
    readOnlyLabel: {
        color: "#CCCCCC",
        fontSize: "0.7rem",
        textTransform: "uppercase",
        verticalAlign: "top",
        marginTop: "5px"
    }
});

class eventEditor extends Component {

    static contextType = AuthenticationContext;

    constructor(props) {
        super(props);

        if(props.date === undefined || 
           props.date.month === undefined || 
           props.date.day === undefined || 
           props.date.year === undefined) {
            throw new Error("'date' prop must be defined with format { month: number, day: number, year: number }");
        }
        
        this.state = {
            mode: "list", //One of: list, new, edit, delete

            /**
             * The current event that's being created or edited.
             */
            event: undefined,

            /**
             * Determines whether errors should be shown related to event creation/editing.
             */
            showErrors: false,

            /**
             * Events with detailed information.
             */
            eventsDetails: []
        }

        this.componentUnmounted = false;
    }

    async componentDidMount() {
        //Event editor has received an array of events. User added events are complete. Events specified in the data service need to have
        //their details retrieved. getEventsDetails() handles both types of events.

        var eventsDetails = await this.getEventsDetails();
       
        if(!this.componentUnmounted) {
            this.setState((state) => produce(state, draft => { 
                eventsDetails.forEach((value) => {
                    draft.eventsDetails.push(Object.freeze(value));
                })
            }));
        }
    }

    componentWillUnmount() {
        this.componentUnmounted = true;
    }

    getEventsDetails = async () => {
        //The event editor shows information related to the currently selected day, so get the related events.
        var events = this.props.events;

        if(events.length > 0) {
            var api = new ApiClient();
            api.context = this.context;
            api.redirectOnUnauthorized = true;

            var details = [];

            function handleDetails(event) {
               handleEventDetails(event, true);
            }

            function handleEventDetails(event, readonly) {
                details.push({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    readonly: readonly //events retrieved from API should be read only
                });
            }

            function handleDetailsError(statusCode) {
                throw new Error("One or more errors occurred loading events details.");
            }

            for(var i = 0; i < events.length; i++) {
                var id = events[i].id;
                
                //Demo application doesn't save user-added events. If an event's isRemote property is true,
                //then query from the data service.

                if(events[i].isRemote) {
                    //Each API call is awaited
                    await api.getEventById(id, handleDetails, handleDetailsError);
                } else {
                    handleEventDetails(events[i], false);
                }


            }
            
            //Because each API call above is awaited, the details array is complete by this point.
            return details;

        }

        return [];
       
    }

    newEvent = () => {
        this.setState((state) => produce(state, draft => { draft.mode = "new"; }));
    }

    editEvent = (id, e) => {
        var events = this.state.eventsDetails;

        for(var i = 0; i < events.length; i++) {
            if(events[i].id.toLowerCase() === id.toLowerCase()) {
                //eslint-disable-next-line
                this.setState((state) => produce(state, draft => { 
                    draft.event = events[i] 
                }));
                break;
            }
        }

        this.setState((state) => produce(state, draft => { draft.mode = "edit"; }));
    }

    deleteEvent = (id, e) => {
        this.setState((state) => produce(state, draft => { 
            draft.mode = "delete";
            draft.event = { id: id };
        }));

        Object.freeze(this.state.event);
    }

    deleteEventConfirmed = (id) => {
        //Remove the event from the eventsDetails, and then notify the Calendar that it needs removal.

        this.setState((state) => produce(state, draft => {
            for(var i = 0; i < draft.eventsDetails.length; i++) {
                if(id.toLowerCase() === draft.eventsDetails[i].id.toLowerCase()) {
                    draft.eventsDetails.splice(i, 1);
                    break;
                }
            }
        }), () => {
            if(this.props.deleteEvent !== undefined && typeof this.props.deleteEvent !== "function") {
                throw new Error("deleteEvent must be a function.");
            }

            //It's unnecessary to switch back to "list" mode after deletion in the Calendar component because 
            //the EventEditor is instantiated with a "key" in Calendar that factors in the events. Deleting the 
            //event in the Calendar component will cause a new component to be created which will already have 
            //its mode set to list.

            this.props.deleteEvent(id);
        });
    }

    dialogExited = () => {
        //Stop creating/editing an event and return to list mode.
        this.setState((state) => produce(state, draft => {
            draft.mode = "list";
            draft.event = undefined;
            draft.showErrors = false;
        }));
    }

    /**
     * Fired when the EventInformation component has a new/modified event. An event is only provided when the event is complete.
     */
    eventChanged = (event) => {
        this.setState((state) => produce(state, draft => {
            event.hasValidationErrors = false;
            Object.freeze(event);
            draft.event = event;
        }));
    }

    /**
     * Fired when the EventInformation component has validation errors.
     */
    eventHasValidationErrors = () => {
        this.setState((state) => produce(state, draft => { 
            if(draft.event) {
                draft.event.hasValidationErrors = true;
            }
        }));

        Object.freeze(this.state.event);
    }

    /**
     * Fired when the "Create Event" button is toggled.
     */
    createEvent = () => {
        if(this.state.event === undefined || this.state.event.hasValidationErrors) {            
            this.toggleShowErrors();
            return;
        }

        if(this.props.addEvent && typeof this.props.addEvent === "function") {
            this.props.addEvent(this.state.event);
        }

        //Close the dialog.
        this.props.close();
    }

    /**
     * Fired when the "Save Event" button is toggled.
     */
    saveEvent = () => {
        if(this.state.event === undefined) {
            throw new Error("Event must be defined when editing.");
        }

        if(this.state.event.hasValidationErrors) {
            this.toggleShowErrors();
            return;
        }

        var id = this.state.event.id.toLowerCase();

        //Update event values.

        var updatedEvent = undefined;
        for(var i = 0; i < this.state.eventsDetails.length; i++) {
            if(this.state.eventsDetails[i].id.toLowerCase() === id) {
                //eslint-disable-next-line
                var updatedState = produce(this.state, draft => {
                    draft.eventsDetails[i].title = this.state.event.title;
                    draft.eventsDetails[i].description = this.state.event.description;
                    draft.eventsDetails[i].readonly = this.state.event.reaodnly;
                    draft.eventsDetails[i].isRemote = this.state.event.isRemote;
                    draft.eventsDetails[i].startDate = Date.parse(this.state.event.date);
                    draft.eventsDetails[i].stopDate = Date.parse(this.state.event.date);
                });

                updatedEvent = updatedState.eventsDetails[i];

                //eslint-disable-next-line
                this.setState((state) => produce(state, draft => { 
                    draft.eventsDetails[i] = updatedEvent;
                }));

                break;
            }
        }

        if(updatedEvent !== undefined) {
            if(this.props.saveEvent && typeof this.props.saveEvent === "function") {
                this.props.saveEvent(updatedEvent);
            }
        }

        //Close the dialog.
        this.props.close();
    }

    toggleShowErrors = () => {
        //Show errors. Components rely on a change in the showErrors prop to determine whether
        //to validate, so it's necessary to sequentially toggle the showErrors prop in case
        //validation has already occurred.
        this.setState((state) => produce(state, draft => { 
            draft.showErrors = false;
        }), () => {
            this.setState((state) => produce(state, draft => {
                draft.showErrors = true;
            }));
        });
    }


    render() {

        var date = Time.getMonthName(this.props.date.month) + " " + this.props.date.day + ", " + this.props.date.year;

        var details = [];

        if(this.state.eventsDetails.length <= 0) {
            details = <div>No events scheduled.</div>
        } else {
            var i = 0;
            this.state.eventsDetails.forEach((value) => {

                var editButton = undefined;

                if(value.readonly) {
                    editButton = <div className={this.props.classes.readOnlyLabel}>Readonly</div>;
                } else {
                    editButton = <Button onClick={this.editEvent.bind(this, value.id)}>Edit</Button>;
                }


                var deleteButton = undefined;

                if(!value.readonly) {
                    deleteButton = <Button onClick={this.deleteEvent.bind(this, value.id)}>Delete</Button>
                }

                details.push(
                    <div key={ "event-details-" + i }>
                        <div className={this.props.classes.eventDisplay}>
                            <div>
                                <div className={this.props.classes.eventTitle}>{value.title}</div>
                                <div className={this.props.classes.eventDescription}>{value.description}</div>
                            </div>
                        </div>
                        <div className={this.props.classes.eventEditButton}>{editButton}</div>
                        <div className={this.props.classes.eventDeleteButton}>{deleteButton}</div>
                        <div className={this.props.classes.horizontalRule} />
                    </div>
                );
                i++;
            })
        }

        var content = <div></div>;

        var mode = this.state.mode.toLowerCase();

        if(mode === "list") {
            //Show a listing of events that can be edited
            content =
                <div className={this.props.classes.dialog}>
                    <DialogTitle>Events for {date}</DialogTitle>
                    <DialogContent>
                        {details}
                        <div>
                            <Button className={this.props.classes.newEventButton} variant="contained" color="primary" size="small" onClick={this.newEvent}>Add Event</Button>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={this.props.close}>Done</Button>
                    </DialogActions>
                </div>;
        } else if(mode === "new") {
            //Enable adding a new event
            content =
            <div className={this.props.classes.dialog}>
                <DialogTitle>
                    Add Event
                    <Typography>{date}</Typography>
                </DialogTitle>
                <DialogContent>
                    <EventInformation notifyEventChanged={this.eventChanged} 
                                      initialMonth={this.props.date.month} 
                                      initialDay={this.props.date.day} 
                                      initialYear={this.props.date.year}
                                      showErrors={this.state.showErrors} 
                                      hasValidationErrors={this.eventHasValidationErrors}/>
                </DialogContent>
                <DialogActions>
                        <Button color="primary" variant="contained" onClick={this.createEvent}>Create Event</Button>
                        <Button color="primary" onClick={this.props.close}>Cancel</Button>
                </DialogActions>
            </div>;
        } else if(mode === "edit") {
            //Enable editing an event
            content =
            <div className={this.props.classes.dialog}>
                <DialogTitle>
                    Edit Event
                    <Typography>{date}</Typography>
                </DialogTitle>
                <DialogContent>
                    <EventInformation notifyEventChanged={this.eventChanged} 
                                      initialMonth={this.props.date.month} 
                                      initialDay={this.props.date.day} 
                                      initialYear={this.props.date.year}
                                      initialTitle={this.state.event.title}
                                      initialDescription={this.state.event.description} 
                                      id={this.state.event.id}
                                      showErrors={this.state.showErrors}
                                      hasValidationErrors={this.eventHasValidationErrors} />
                </DialogContent>
                <DialogActions>
                        <Button color="primary" variant="contained" onClick={this.saveEvent}>Save Event</Button>
                        <Button color="primary" onClick={this.props.close}>Cancel</Button>
                </DialogActions>
            </div>;
        } else if(mode === "delete") {
            //Enable deleting an event. The delete dialog encapsulates the delete/cancel buttons, so it's necessary
            //to pass props related to that functionality.

            content =
                <div className={this.props.classes.dialog}>
                    <DeleteDialogContent title="Delete Event: Are you sure?" 
                                         text="You can't undo this action."
                                         id={this.state.event.id}
                                         close={this.props.close} 
                                         onDelete={this.deleteEventConfirmed} />
                </div>;
        } else {
            throw new Error("Unexpected mode.");
        }
        
        
        return(
            <Dialog open={this.props.open} 
                    onClose={this.props.close} 
                    fullScreen={this.props.fullScreen}
                    onExited={this.dialogExited}>
                    {content}
            </Dialog>
        );
    }
}


const ResponsiveEventEditor = withMobileDialog()(withStyles(styles)(eventEditor));

/**
 * Displays a responsive dialog for editing events.
 *  
 * @param {object} date The date which the editor should edit, in the form of: { month: number, day: number, year: number }
 * @param {function} addEvent A callback in the form of function(event) which is called when the user adds an event
 * @param {function} saveEvent A callback in the form of function(event) which is called when the user saves an existing event
 * @param {function} deleteEvent A callback in the form of function(id) which is called when the user deletes an existing event
 * @param {array} events An array of events, in the form of: [{ id: string, title: string, description:string, readonly: string, startDate: string, stopDate: string },...].
 * Note that startDate and stopDate should be in string format such as "mm/dd/yyyy hh:mm:ss".
 *      
 */
class EventEditor extends Component {

    render() {
        return <ResponsiveEventEditor {...this.props} />;
    }
}

export { EventEditor }