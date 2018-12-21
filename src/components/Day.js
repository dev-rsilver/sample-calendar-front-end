
import React, {Component} from 'react';

import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

const styles = {
    dayDiv: {
        background: "white",
        padding: 5,
        color: "black",
        textAlign: "left",
        marginRight:5,
        marginBottom:5,
        width: "100%"
    },
    numberDiv: {
        fontSize: "1.2rem",
        fontWeight: "light"
    }
};

class styledDayDiv extends Component {


    constructor(props) {
        super(props);

        if(props.events === undefined) {
            throw new Error("'events' prop must be defined.");
        }
    }

    selectDay = () => {
        if(this.props.onSelect && typeof this.props.onSelect === "function") {
            this.props.onSelect(this.props.month, this.props.day, this.props.year);
        }
    }
    
    

    render() {
        
        var isSelectedDay = this.props.isSelected;

        var isCurrentDate = this.props.month === new Date().getMonth() + 1 && //getMonth() starts at zero so add 1
                            this.props.day === new Date().getDate() &&
                            this.props.year === new Date().getFullYear() ? true : false;

        var text = [];

        if(this.props.showToday && isCurrentDate) {
            text.push(<Typography key="today" className={this.props.classes.numberDiv}>Today!</Typography>);
        }

        var i = 0;
        this.props.events.forEach((value) => {
            text.push(<Typography key={"title-" + i}>{value.title}</Typography>);
            i++;
        });


        var dateDisplay = <div>
            <div className={this.props.classes.numberDiv}>
                {this.props.day}
                {text}
            </div>
        </div>;
        
        return( 
        <div className={this.props.classes.dayDiv} 
             style={{ background: isSelectedDay ? this.props.selectedBackgroundColor : "" }}
             onClick={this.selectDay}>
            {dateDisplay}
        </div>);
    }
}


const StyledDay = withStyles(styles)(styledDayDiv);

/**
 * Component for representing a day on the calendar.
 * 
 * @param {number} month Property: The month represented by the component
 * @param {number} day Property: The day represented by the component
 * @param {number} year Property: The year represented by the component
 * @param {array} events Property: An array of event objects in the form of: [{ title: string }, ...]
 * @param {bool} isSelected Property: Determines whether the day is currently selected
 * @param {string} selectedBackgroundColor Property: The background color of the day if isSelected is true
 * @param {bool} showToday Property: Determines whether the day should show the "Today!" label if it's the current date
 * @param {function} onSelect Property: A callback in the form of function(month, day, year) which will be called when the Day is selected by the user
 * 
 */
class Day extends Component {
    render() {
        return <StyledDay {...this.props} />;
    }
}

export default Day;