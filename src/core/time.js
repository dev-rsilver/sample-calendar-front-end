class Time {
    static getMonthName(month) {
        if(typeof month !== "number") {
            throw new Error("month expected a number");
        }

        switch(month) {
            case 1: return "January";
            case 2: return "February";
            case 3: return "March";
            case 4: return "April";
            case 5: return "May";
            case 6: return "June";
            case 7: return "July";
            case 8: return "August";
            case 9: return "September";
            case 10: return "October";
            case 11: return "November";
            case 12: return "December";
            default: throw new Error("Unexpected month");
        }
    }

    /**
     * Returns a zero-based number (0 = Sunday) indicating the day of the week.
     * @param {*} month Month should be a number between 1 (January) and 12 (December)
     */
    static getDayOfWeek(month, day, year) {
        return new Date(year, month - 1, day).getDay();
    }

    /**
     * Returns the number of days in the given month.
     * @param {*} month Month should be a number between 1 (January) and 12 (December)
     */
    static getDaysInMonth(month, year) {
        month--;

        //To get the days in the month, start at 0 and increment the day until the
        //month changes.

        var day = 0;
        var dt;

        do {
            day++;
            dt = new Date(year, month, day);
        } while(dt.getMonth() === month);

        day--; //reduce by one since the month just changed

        return day;
    }
}

export default Time;