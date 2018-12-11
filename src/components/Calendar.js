import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import Time from '../core/time';

import Day from '../components/Day';

import { EventEditor } from '../components/EventEditor';
import ColorSelector from '../components/ColorSelector';

import { AuthenticationContext } from '../core/api/authentication.js';
import { ApiClient } from '../core/api/api';

import produce from 'immer';

const styles = theme => ({
    title: {
        color: "black",
        display: "inline-block",
        marginTop: 13,
        verticalAlign: "top",
        minWidth: 375,
        [theme.breakpoints.down("sm")]: {
            fontSize: "1.5rem",
            marginTop: 17,
            minWidth: 165
        }
    },
    navButton: {
        display: "inline-block",
        verticalAlign: "top",
        [theme.breakpoints.down("sm")]: {
            maxWidth: 50,
            minWidth: 50,
            marginTop: 2
        }
    },
    navButtonText: {
        [theme.breakpoints.down("sm")]: {
            fontSize: "2.4rem"
        }
    },
    calendar: {
        [theme.breakpoints.down("sm")]: {
            flexWrap: "wrap"
        },
        [theme.breakpoints.up("sm")]: {
            flexWrap: "none"
        },
        display: "flex",
        justifyContent: "center",
        minHeight: 150,
        width: "90%",
        maxWidth: 1250,
        marginLeft: "auto",
        marginRight: "auto"
    },
    eventsLoadingIndicatorContainer: {
        width: "90%",
        maxWidth: 1243,
        marginLeft: "auto",
        marginRight: "auto",
        padding: 0
    },
    progressIndicator: {
        marginLeft: -3
    },
    snackbarContent: {
        backgroundColor: theme.palette.error.dark
    }
});

class styledCalendar extends Component {

    static contextType = AuthenticationContext;

    constructor(props) {
        super(props);

        var currentDate = new Date();

        this.state = {
            selected: {
                currentYear: currentDate.getFullYear(),
                currentMonth: currentDate.getMonth() + 1,
                currentDate: currentDate.getDate()
            },
            showEventEditor: false,
            events: {
                values: [],
                status: "loading", //one of: loading, loaded, error
            },
            selectedBackgroundColor: undefined

        }
    }


    /**
     * Generates an id for an event.
     */
    generateId = (len, events) => {

        var id = undefined;
        var idFound = false;
        var loops = 0;

        do {
            var randomNumbers = new Uint8Array(len);
            window.crypto.getRandomValues(randomNumbers);

            for(var i = 0; i < randomNumbers.length; i++) {
                randomNumbers[i] = randomNumbers[i] % 10;
            }

            id = randomNumbers.join('');

            for(i = 0; i < events.length; i++) {
                if(events[i].id.toLowerCase() === id.toLowerCase()) {
                    idFound = true;
                } else {
                    idFound = false;
                }
            }

            if(loops > 100) {
                throw new Error("Too many id collisions.");
            }

            loops++;

        } while(idFound);

        return id;
        
    }

    componentDidMount() {

        this.validateEventsStatus();

        //Calendar potentially shows events from the current month, previous month, and following month, so load events from the previous month to the next month.
        var previousMonth = this.state.selected.currentMonth - 1 <= 0 ? 12 : this.state.selected.currentMonth - 1;
        var previousYear = this.state.selected.currentMonth - 1 <= 0 ? this.state.selected.currentYear - 1 : this.state.selected.currentYear;

        var nextMonth = this.state.selected.currentMonth + 1 > 12 ? 1 : this.state.selected.currentMonth + 1;
        var nextYear = this.state.selected.currentMonth + 1 > 12 ? this.state.selected.currentYear + 1 : this.state.selected.currentYear;

        //Date constructor expects a 0-based month, so substract one where necessary. Events will be loaded into state.
        this.loadEvents(new Date(previousYear, previousMonth - 1, 1, 0, 0, 0), new Date(nextYear, nextMonth - 1, Time.getDaysInMonth(nextMonth, nextYear), 23, 59, 59));
    }

    componentDidUpdate(prevProps) {
        this.validateEventsStatus();
    }

    validateEventsStatus() {
        if(this.state.events.status !== "loading" &&
           this.state.events.status !== "loaded" &&
           this.state.events.status !== "error") {
               throw new Error("Invalid events status.");
           }
    }

    /**
     * Sets the selected date.
     */
    setSelectedDate = function(month, date, year) {
        this.setState((state) => produce(state, draft => {
            draft.selected.currentYear = year;
            draft.selected.currentMonth = month;
            draft.selected.currentDate = date;
        }), () => { Object.freeze(this.state.selected); });
    }

    /**
    * Adds an event to the calendar. Demo application does not include a database, so events that are added
    * by the user are not persisted.
    * @param {object} event { id: string, title: string, description: string, startDate: string, stopDate: string }
    * Dates expected in date string format such as "mm/dd/yyyy hh:mm:ss".
    */
    addEvent = function(event) {
        this.setState((state) => produce(state, draft => {
            draft.events.values.push({
                id: this.generateId(10, state.events.values),
                title: event.title,
                description: event.description,
                isRemote: false, //Event was created by user rather than retrieved via the API
                startDate: Date.parse(event.date), //Events added by user have the same start and stop date
                stopDate: Date.parse(event.date)
            });
        }), () => {
            Object.freeze(this.state.events.values[this.state.events.values.length - 1]);
            Object.freeze(this.state.events.values);
        });
    }


    /**
    * Saves and updates an existing event. Demo application does not include a database, so events that are added
    * by the user are not persisted.
    * @param {object} event { id: string, title: string, description: string, startDate: string, stopDate: string }
    * Dates expected in date string format such as "mm/dd/yyyy hh:mm:ss".
    */
    saveEvent = function(event) {
        var id = event.id.toLowerCase();

        this.setState((state) => produce(state, draft => {  
            for(var i = 0; i < state.events.values.length; i++) {
                if(id === state.events.values[i].id) {
                    draft.events.values[i].title = event.title;
                    draft.events.values[i].description = event.description;
                    draft.events.values[i].isRemote = event.isRemote;
                    draft.events.values[i].startDate = event.startDate;
                    draft.events.values[i].stopDate = event.stopDate;
                }
            }    
        }));
    }

    /**
     * Deletes an existing event.
     * @param {string} id Id representing the event to delete
     */
    deleteEvent = function(id) {
        
        this.setState((state) => produce(state, draft => { 
            for(var i = 0; i < draft.events.values.length; i++) {
                if(draft.events.values[i].id.toLowerCase() === id.toLowerCase()) {
                    draft.events.values.splice(i, 1);
                    break;
                }
            }
        }));
    }


    /**
     * Filters loaded events. Events are loaded with loadEvents().
     * @param {string} startDate Expects a date string such as "mm/dd/yyyy hh:mm:ss"
     * @param {string} stopDate Expects a date string such as "mm/dd/yyyy hh:mm:ss"
     */
    filterEvents = function(startDate, stopDate) {
        var start = Date.parse(startDate);
        var stop = Date.parse(stopDate);
    
        if(isNaN(start)) {
            throw new Error("Invalid startDate.");
        }

        if(isNaN(stop)) {
            throw new Error("Invalid stopDate.");
        }

        var events = [];
        for(var i = 0; i < this.state.events.values.length; i++) {
            var eventStart = this.state.events.values[i].startDate;
            var eventStop = this.state.events.values[i].stopDate;
            
            //Event may be between and including the date range being compared against.
            var eventIsBetween = eventStart >= start && eventStop <= stop;

            //Event may start before and end within and including the date range being compared against.
            var eventStartsBeforeAndStopsWithin = eventStart < start && (eventStop >= start && eventStop <= stop);

            //Event may start before and end after the date range being compared against.
            var eventStartsBeforeAndEndsAfter = eventStart < start && eventStop > stop;

            //Event may start within and including the date range and end after the date range being compared against.
            var eventStartsWithinAndEndsAfter = (eventStart >= start && eventStart <= stop) && (eventStop > stop);

            if(eventIsBetween || eventStartsBeforeAndStopsWithin || eventStartsBeforeAndEndsAfter || eventStartsWithinAndEndsAfter) {
                events.push(produce(this.state.events.values[i], draft => { }));
            }
        }
        
        return events;
    }

    /**
     * Loads events for the specified time frame.
     * @param {string} startDate Expects a date string such as "mm/dd/yyyy hh:mm:ss"
     * @param {string} stopDate Expects a date string such as "mm/dd/yyyy hh:mm:ss"
     */
    loadEvents = (startDate, stopDate) => {
         var api = new ApiClient();
         api.context = this.context;
         api.redirectOnUnauthorized = true;

         var start = Date.parse(startDate);
         var stop = Date.parse(stopDate);

         if(isNaN(start)) {
             throw new Error("Invalid startDate.");
         }

         if(isNaN(stop)) {
             throw new Error("Invalid stopDate.");
         }

         api.getEvents(
             startDate,
             stopDate,
             0, 
             500, 
             (events) => {
                 this.setState((state) => produce(state, draft => {
                     draft.events.values = events;

                     //Mark these events as originating from the API.
                     draft.events.values.forEach((value) => {
                        value.isRemote = true;
                        Object.freeze(value);
                     });

                     draft.events.error = false;
                     draft.events.status = "loaded";

                     Object.freeze(draft.events.values);
                 }));
             }, (statusCode) => {
                 this.setState((state) => produce(state, draft => {
                     draft.events.values = [];
                     draft.events.status = "error";
                     Object.freeze(draft.events.values);
                 }));
             }
         );
    }

    nextMonth = () => {
        this.setState((state) => produce(state, draft => {
            var currentMonth = state.selected.currentMonth;
            var currentYear = state.selected.currentYear;
            draft.selected.currentMonth = currentMonth + 1 > 12 ? 1 : currentMonth + 1;
            draft.selected.currentYear = currentMonth + 1 > 12 ? currentYear + 1 : currentYear;
        }));
    };

    previousMonth = () => {
        this.setState((state) => produce(state, draft => {
            var currentMonth = state.selected.currentMonth;
            var currentYear = state.selected.currentYear;
            draft.selected.currentMonth = currentMonth - 1 <= 0 ? 12 : currentMonth - 1;
            draft.selected.currentYear = currentMonth - 1 <= 0 ? currentYear - 1 : currentYear;
        }));
    };

    showEventEditor = () => {
        this.setState((state) => produce(state, draft => { draft.showEventEditor = true }));
    }

    closeEventEditor = (onSuccessCallback) => {
        this.setState((state) => produce(state, draft => { draft.showEventEditor = false }));
    }

    setSelectedBackgroundColor = (color) => {
        this.setState((state) => produce(state, draft => { 
            draft.selectedBackgroundColor = color;
        }));
    }

    render() {
        var currentMonth = this.state.selected.currentMonth;
        var currentYear = this.state.selected.currentYear;

        var monthStartDay = Time.getDayOfWeek(currentMonth, 1, currentYear);

        var daysInMonth = Time.getDaysInMonth(currentMonth, currentYear);
        var monthEndDay = Time.getDayOfWeek(currentMonth, daysInMonth, currentYear);

        //Get days in previous month, rolling over to another year if necessary.
        var daysInPreviousMonth = Time.getDaysInMonth(currentMonth - 1 > 0 ? currentMonth - 1 : 12, currentMonth - 1 < 1 ? currentYear - 1 : currentYear);

        var rows = [];

        //The number of rows to display must account for the fact that the month will not always
        //start on the first column of the first row. For example, the 1st of the month could be
        //on a Wednesday.
        var numRows = Math.ceil((daysInMonth + monthStartDay) / 7);

        var daysLeft = Time.getDaysInMonth(currentMonth, currentYear);

        for(var i = 0; i < numRows; i++) {
            var cols = [];

            //Include partials from the previous month. Notice compound i, j conditions to limit execution 
            //to the first row and less than the starting day of the current month.
            for(var j = 0; i <= 0 && j < monthStartDay; j++) {
                var day = daysInPreviousMonth - monthStartDay + j + 1;

                cols.push(
                    <Day key={day + "-previous"} 
                         day={day} 
                         month={currentMonth - 1 > 0 ? currentMonth - 1 : 12} 
                         year={currentMonth - 1 < 1 ? currentYear - 1 : currentYear} 
                         isSelected={this.state.selected.currentMonth === (currentMonth - 1 > 0 ? currentMonth - 1 : 12) && 
                                     this.state.selected.currentDate === day && 
                                     this.state.selected.currentYear === (currentMonth - 1 < 1 ? currentYear - 1 : currentYear)} 
                         onSelect={ (month, day, year) => { 
                            this.setSelectedDate(month, day, year); 
                            this.showEventEditor();
                         }}
                         events={this.filterEvents(
                             (currentMonth - 1 > 0 ? currentMonth - 1 : 12) + "/" + day + "/" + (currentMonth - 1 < 1 ? currentYear - 1 : currentYear) + " 00:00:00", 
                             (currentMonth - 1 > 0 ? currentMonth - 1 : 12) + "/" + day + "/" + (currentMonth - 1 < 1 ? currentYear - 1 : currentYear) + " 23:59:59")}
                    />
                );
            }

            //Include the current month. Will execute for all 7 days, unless we're in the first week.
            for(j = 0; j < 7 - monthStartDay && daysLeft > 0; j++) {
                day = daysInMonth - daysLeft + 1;
                cols.push(
                    <Day key={day}
                         day={day} 
                         month={currentMonth} 
                         year={currentYear} 
                         isSelected={this.state.selected.currentMonth === currentMonth && 
                            this.state.selected.currentDate === day && 
                            this.state.selected.currentYear === currentYear} 
                         onSelect={ (month, day, year) => { 
                             this.setSelectedDate(currentMonth, day, currentYear); 
                             this.showEventEditor();
                         }}
                         selectedBackgroundColor = {this.state.selectedBackgroundColor}
                         showToday={true}
                         events={this.filterEvents(
                            currentMonth + "/" + day + "/" + currentYear + " 00:00:00", 
                            currentMonth + "/" + day + "/" + currentYear + " 23:59:59")}
                    /> 
                );
                daysLeft--;
            }

            //Set monthStartDay to 0 so that we execute a full week on next iteration (see above loop).
            monthStartDay = 0;

            //Finally, include partials from the next month. Notice compound i, j conditions.
            for(j = 0; i >= numRows - 1 && j < 7 - monthEndDay - 1; j++) {
                day = j + 1;

                cols.push(
                    <Day key={day + "-next"}
                         day={j + 1} 
                         month={currentMonth + 1 <= 12 ? currentMonth + 1 : 1} 
                         year={currentMonth + 1 <= 12 ? currentYear : currentYear + 1}
                         isSelected={this.state.selected.currentMonth === (currentMonth + 1 <= 12 ? currentMonth + 1 : 1) && 
                            this.state.selected.currentDate === day && 
                            this.state.selected.currentYear === (currentMonth + 1 <= 12 ? currentYear : currentYear + 1)} 
                         onSelect={ (month, day, year) => { 
                            this.setSelectedDate(month, day, year); 
                            this.showEventEditor();
                         }}
                         events={this.filterEvents(
                            (currentMonth + 1 <= 12 ? currentMonth + 1 : 1) + "/" + day + "/" + (currentMonth + 1 <= 12 ? currentYear : currentYear + 1) + " 00:00:00", 
                            (currentMonth + 1 <= 12 ? currentMonth + 1 : 1) + "/" + day + "/" + (currentMonth + 1 <= 12 ? currentYear : currentYear + 1) + " 23:59:59")}
                    />
                );
            }


            rows.push(cols);
        }

        var previousButton = <Button onClick={this.previousMonth} className={this.props.classes.navButton}><Typography className={this.props.classes.navButtonText} variant="h2">&lt;</Typography></Button>
        var nextButton = <Button onClick={this.nextMonth}  className={this.props.classes.navButton}><Typography variant="h2" className={this.props.classes.navButtonText}>&gt;</Typography></Button>

        //Display a progress bar while loading and a snackbar if there's an error.

        var linearProgress = undefined;       
        var snackbar = undefined;

        if(this.state.events.status.toLowerCase() === "loading") {
            linearProgress = <LinearProgress className={this.props.classes.progressIndicator} />
        } else if(this.state.events.status.toLowerCase() === "error") {
            snackbar = <Snackbar open={true}
                                 anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                                 <SnackbarContent className={this.props.classes.snackbarContent} 
                                                  message={<span id="snackbarMessage">Error: Could not load events</span>}
                                                  aria-labelledby="snackbarMessage"/>
                       </Snackbar>;

        }
        
        var eventsLoadingIndicator = <div className={this.props.classes.eventsLoadingIndicatorContainer}>
                                        {linearProgress}
                                        {snackbar}
                                     </div>;

        var header = <div>
                        {previousButton}
                        <Typography variant="h3" className={this.props.classes.title}>
                        {Time.getMonthName(currentMonth)} {currentYear}</Typography>
                        {nextButton}

                        <div>
                            <Typography>
                                Selected Day Color:
                            </Typography>
                            <ColorSelector 
                                colors={["#00CCFF", "#009999", "#876FFF", "#CC0033", "#FFCC33", "#FF6633"]}
                                onColorSelected={ (color) => { this.setSelectedBackgroundColor(color); }}
                            />
                        </div>

                        {eventsLoadingIndicator}
                    </div>;

        //Create a calendar that differs based on screen size, utilizing flex boxes and breakpoint-based rules located in
        //styles.calendar.

        var calendarDisplay = undefined;

        var containerRows = [];

        for(i = 0; i < rows.length; i++) {

            var containerColumns = [];

            for(j = 0; j < rows[i].length; j++) {
                containerColumns.push(
                    rows[i][j]
                );
            }

            containerRows.push(<div key={i} className={this.props.classes.calendar}>
                                    {containerColumns}
                               </div>
            );
        }

        calendarDisplay = <React.Fragment>{containerRows}</React.Fragment>;

        return (<React.Fragment>
                    <div>{header}{calendarDisplay}</div>
                    <EventEditor open={this.state.showEventEditor}
                                 close={this.closeEventEditor} 
                                 date={ { month: this.state.selected.currentMonth, day: this.state.selected.currentDate, year: this.state.selected.currentYear }} 
                                 events={this.filterEvents(this.state.selected.currentMonth + "/" + this.state.selected.currentDate + "/" + this.state.selected.currentYear + " 00:00:00",
                                                           this.state.selected.currentMonth + "/" + this.state.selected.currentDate + "/" + this.state.selected.currentYear + " 23:59:59") } 

                                 addEvent={ (event) => { this.addEvent(event); } }
                                 saveEvent={ (event) => { this.saveEvent(event); } }
                                 deleteEvent={ (id) => { this.deleteEvent(id); } }

                                 //Setting a key forces the creation of new EventEditor components in response to changes. Otherwise, it would be necessary to deal
                                 //with complex updates based on changing props within the EventEditor itself.
                                 key={[this.state.selected.currentMonth,
                                      this.state.selected.currentDate, 
                                      this.state.selected.currentYear,
                                      this.state.events.loaded,
                                      this.filterEvents(this.state.selected.currentMonth + "/" + this.state.selected.currentDate + "/" + this.state.selected.currentYear + " 00:00:00",
                                                        this.state.selected.currentMonth + "/" + this.state.selected.currentDate + "/" + this.state.selected.currentYear + " 23:59:59") ]}
                    />
                </React.Fragment>);
    }
}


const StyledCalendar = withStyles(styles)(styledCalendar);
class Calendar extends Component {

    render() {
        
        return <StyledCalendar {...this.props} />
            
    }
   
}

export default Calendar;