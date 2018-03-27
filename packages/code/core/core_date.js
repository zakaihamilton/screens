/*
 @author Zakai Hamilton
 @component CoreDate
 */

screens.core.date = function CoreDate(me) {
    me.getDayText = function(date) {  
        var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        return days[date.getDay()];
    };
};
