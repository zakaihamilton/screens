/*
 @author Zakai Hamilton
 @component CoreDate
 */

screens.core.date = function CoreDate(me, packages) {
    me.getDayText = function (date) {
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[date.getDay()];
    };
};
