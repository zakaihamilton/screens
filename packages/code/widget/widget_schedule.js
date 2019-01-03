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
    me.link = {
        get: function (object) {
            return object.schedule_method;
        },
        set: function (object, method) {
            object.schedule_method = method;
        }
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
                let classes = ["widget-schedule-" + key];
                let styles = { "grid-column-start": item.start, "grid-column-end": item.end };
                let attributes = {};
                html += me.item(classes, styles, attributes, item.value);
            }
        });
        for (let weekday = 0; weekday < 7; weekday++) {
            let rowIndex = 5;
            let dayDate = new Date(currentDate);
            dayDate.setDate(currentDate.getDate() + weekday);
            for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
                let event = events[eventIndex];
                if (event.date.year !== dayDate.getFullYear()) {
                    continue;
                }
                if (event.date.month !== dayDate.getMonth()) {
                    continue;
                }
                if (event.date.day !== dayDate.getDate()) {
                    continue;
                }
                let classes = ["widget-schedule-event"];
                let styles = { "grid-column": (weekday + 1), "grid-row": rowIndex };
                let attributes = {
                    "onclick": "screens.widget.schedule.click(this," + eventIndex + ")"
                };
                html += me.item(classes, styles, attributes, event.name);
                rowIndex++;
            }
        }
        me.core.property.set(object, "ui.basic.html", html);
    };
    me.click = function (object, index) {
        var widget = me.ui.node.container(object, me.id);
        var event = widget.schedule_events[index];
        me.core.property.set(widget, widget.schedule_method, event);
    };
    me.item = function (classes, styles, attributes, value) {
        var html = "<div";
        if (classes && classes.length) {
            html += " class=\"" + classes.join(" ") + "\"";
        }
        if (styles && Object.keys(styles).length) {
            html += " style=\"";
            for (let name in styles) {
                html += name + ":" + styles[name] + ";";
            }
            html += "\"";
        }
        if (attributes && Object.keys(attributes).length) {
            for (let name in attributes) {
                html += " " + name + "=\"" + attributes[name] + "\"";
            }
        }
        html += ">";
        if (value) {
            html += value;
        }
        html += "</div>";
        return html;
    };
};
