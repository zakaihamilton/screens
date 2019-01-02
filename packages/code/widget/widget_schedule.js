/*
 @author Zakai Hamilton
 @component WidgetSchedule
 */

screens.widget.schedule = function WidgetSchedule(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "container",
            "ui.basic.elements": [

            ]
        }
    };
    me.init = function () {

    };
    me.events = {
        get: function (object) {
            return object.schedule_events;
        },
        set: function (object, events) {
            object.schedule_events = events;
            me.redraw(object);
        }
    };
    me.redraw = function (object) {
        var events = object.schedule_events;
        var html = "";
        var currentDate = new Date();
        if (events && events.length) {
            let date = events[0].date;
            currentDate = new Date(date.year, date.month, date.day);
        }
        var rows = {};
        for (let weekday = 0; weekday < 7; weekday++) {
            let dayDate = new Date(currentDate);
            dayDate.setDate(currentDate.getDate() + weekday);
            Object.entries({ year: "numeric", month: "long", day: "numeric", weekday: "long" }).forEach(([key, type]) => {
                var options = {};
                options[key] = type;
                var value = dayDate.toLocaleString("en-us", options);
                var row = rows[key];
                if (!row) {
                    row = rows[key] = [];
                }
                if (row.length && row[row.length - 1].value === value) {
                    row[row.length - 1].end++;
                }
                else {
                    row.push({ start: weekday + 1, end: weekday + 2, value });
                }
            });
        }
        Object.entries(rows).forEach(([key, list]) => {
            for (var item of list) {
                html += me.item(["widget-schedule-" + key], ["grid-column-start:" + item.start, "grid-column-end:" + item.end], item.value);
            }
        });
        for (let weekday = 0; weekday < 7; weekday++) {
            let rowIndex = 5;
            let dayDate = new Date(currentDate);
            dayDate.setDate(currentDate.getDate() + weekday);
            for (let event of events) {
                if (event.date.year !== dayDate.getFullYear()) {
                    continue;
                }
                if (event.date.month !== dayDate.getMonth()) {
                    continue;
                }
                if (event.date.day !== dayDate.getDate()) {
                    continue;
                }
                html += me.item(["widget-schedule-event"], ["grid-column:" + (weekday + 1), "grid-row:" + rowIndex], event.name);
                rowIndex++;
            }
        }
        me.core.property.set(object, "ui.basic.html", html);
    };
    me.item = function (classes, styles, value) {
        var html = "<div";
        if (classes && classes.length) {
            html += " class=\"" + classes.join(" ") + "\"";
        }
        if (styles && styles.length) {
            html += " style=\"" + styles.join(";") + "\"";
        }
        html += ">";
        if (value) {
            html += value;
        }
        html += "</div>";
        return html;
    };
};
