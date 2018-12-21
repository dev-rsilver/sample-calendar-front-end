import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from './Calendar';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import theme from '../core/theme/theme';

import { TestHelper } from '../core/testHelpers.js';

/* Sample tests follow. In particular, tests for this component highlight mock functions, testing methods located on the 
component, and testing that certain complex behaviors of the component align with expectations. For a DOM manipulation 
example, see ColorSelector.test.js. In a production application, tests could be more comprehensive. */

var mockEvents = [
    {
        id: "110293",
        title: "Global Test Event",
        description: "This is a test event description for a global event.",
        startDate: Date.now(),
        stopDate: Date.now()
    },
    {
        id: "110295",
        title: "Thanksgiving",
        description: "It's a holiday!",
        startDate: Date.now(),
        stopDate: Date.now()
    },
    {
        id: "110296",
        title: "A Multiday Event",
        description: "This is a multiday event",
        startDate: Date.now(),
        stopDate: Date.now()
    }
]

jest.mock('../core/api/api.js', () => {
    return {
        ApiClient: function() {
            return {
                getEvents: (startDate, stopDate, index, num, successCallback, failureCallback) => {
                    
                    //Return a new copy of each event since the component(s) may freeze them. If events were being created
                    //as a result of an external API call, each API call would result in a new set of events, so creating
                    //a copy provides for similar behavior.

                    var events = [];

                    mockEvents.forEach((value) => {
                        events.push({
                            id: value.id,
                            title: value.title,
                            description: value.description,
                            startDate: value.startDate,
                            stopDate: value.stopDate
                        });
                    })

                    successCallback(events);
                },
                getEventById: (id, successCallback, failureCallback) => {
                    mockEvents.forEach((value) => { 
                        if(value.id.toLowerCase() === id.toLowerCase()) {
                            successCallback(value); 
                            return value; 
                        } 
                    });
                }
            }
        }
    }
});

var themeObj = createMuiTheme(theme);

it('renders without crashing', () => {
    const div = document.createElement('div');
    
    var component =  <MuiThemeProvider theme={themeObj}>
                        <Calendar />
                    </MuiThemeProvider>;
                    
    ReactDOM.render(component, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('displays events', () => {
    //Determines whether mock events are properly displayed.

    const div = document.createElement('div');
    
    var component =  <MuiThemeProvider theme={themeObj}>
                        <Calendar />
                    </MuiThemeProvider>;

    ReactDOM.render(component, div);

    var events = div.querySelectorAll("div[class^='styledDayDiv'] p");

    //The number of displayed events should be the number of mock events plus an event
    //for "Today!".
    expect(events.length).toBe(mockEvents.length + 1);

    events.forEach((value) => {
        var found = false;

        mockEvents.forEach((mockValue) => {
            if(value.textContent === mockValue.title) {
                found = true;
                return;
            }
        })

        if(value.textContent !== "Today!") {
            expect(found).toEqual(true);
        }
    })

    ReactDOM.unmountComponentAtNode(div);
    

});

it('displays today', () => {

    //Determines whether the "Today!" label is present.

    const div = document.createElement('div');
    
    var component =  <MuiThemeProvider theme={themeObj}>
                        <Calendar />
                    </MuiThemeProvider>;

    ReactDOM.render(component, div);

    var found = TestHelper.hasElement(div, "div[class^='styledDayDiv'] p", "today", false);
    
    expect(found).toEqual(true);

    ReactDOM.unmountComponentAtNode(div);
});

it('adds event', () => {

    const div = document.createElement('div');
    
    var methodsObject = {};

    var component = <MuiThemeProvider theme={themeObj}>
                        <Calendar getMethods={ (methodsObj) => methodsObject = methodsObj } />
                    </MuiThemeProvider>;
    
    ReactDOM.render(component, div);

    var eventTitle = "A Special Event";

    var currentDate = new Date();
    
    //getMonth() returns a 0-based index, so add 1.
    var dateString = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + " 2:00:00";
    
    methodsObject.addEvent({ 
        title: eventTitle,
        description: "A special event",
        date: dateString
    });

    //Refresh after adding event.
    ReactDOM.render(component, div);
    
    //Check for added event.
    var found = TestHelper.hasElement(div, "div[class^='styledDayDiv'] p", eventTitle, false);
    
    expect(found).toEqual(true);

    ReactDOM.unmountComponentAtNode(div);
});

it('saves event', () => {

    const div = document.createElement('div');
    
    var methodsObject = {};

    var component = <MuiThemeProvider theme={themeObj}>
                        <Calendar getMethods={ (methodsObj) => methodsObject = methodsObj } />
                    </MuiThemeProvider>;
    
    ReactDOM.render(component, div);

    var eventTitle = "A Special Event";

    var currentDate = new Date();
    
    //getMonth() returns a 0-based index, so add 1.
    var dateString = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + " 2:00:00";
    
    //The returned event will contain an id that will allow for updating the event.
    var event = methodsObject.addEvent({ 
        title: eventTitle,
        description: "A special event",
        date: dateString
    });

    //Update the event and save.
    var newEventTitle = "New Event";
    event.title = newEventTitle;
    methodsObject.saveEvent(event);
    
    ReactDOM.render(component, div);

    var found = TestHelper.hasElement(div, "div[class^='styledDayDiv'] p", eventTitle, false);
    
    expect(found).toEqual(false);

    found = TestHelper.hasElement(div, "div[class^='styledDayDiv'] p", newEventTitle, false);
    
    expect(found).toEqual(true);
    
    ReactDOM.unmountComponentAtNode(div);
});

it('deletes event', () => {
    const div = document.createElement('div');
    
    var methodsObject = {};

    var component = <MuiThemeProvider theme={themeObj}>
                        <Calendar getMethods={ (methodsObj) => methodsObject = methodsObj } />
                    </MuiThemeProvider>;
    
    ReactDOM.render(component, div);

    var eventTitle = "A Special Event";

    var currentDate = new Date();
    
    //getMonth() returns a 0-based index, so add 1.
    var dateString = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + " 2:00:00";
    
    //The returned event will contain an id that will allow for updating the event.
    var event = methodsObject.addEvent({ 
        title: eventTitle,
        description: "A special event",
        date: dateString
    });

    //Delete event and check that it's been deleted.
    methodsObject.deleteEvent(event.id);
    
    ReactDOM.render(component, div);

    var found = TestHelper.hasElement(div, "div[class^='styledDayDiv'] p", eventTitle, false);
    
    expect(found).toEqual(false);
    
    ReactDOM.unmountComponentAtNode(div);
});