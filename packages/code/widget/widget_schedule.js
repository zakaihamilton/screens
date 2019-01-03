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
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "grid",
                    "ui.basic.var": "grid"
                },
                {
                    "ui.basic.tag": "a",
                    "ui.class.class": ["nav", "previous"],
                    "ui.basic.html": "&#8249;",
                    "ui.touch.click": "previous"
                },
                {
                    "ui.basic.tag": "a",
                    "ui.class.class": ["nav", "next"],
                    "ui.basic.html": "&#8250;",
                    "ui.touch.click": "next"
                }
            ]
        }
    };
    me.init = function () {

    };
    me.methods = {
        get: function (object) {
            return object.schedule_methods;
        },
        set: function (object, methods) {
            object.schedule_methods = methods;
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
    me.start = {
        get: function (object) {
            return object.schedule_start;
        },
        set: function (object, start) {
            object.schedule_start = start;
            me.redraw(object);
        }
    };
    me.redraw = function (object) {
        var events = object.schedule_events;
        if (!events) {
            events = [];
        }
        var html = "";
        var today = new Date();
        var currentDate = new Date();
        if (object.schedule_start) {
            let date = object.schedule_start;
            currentDate = new Date(date.year, date.month, date.day);
        }
        var rows = {};
        for (let weekday = 0; weekday < 7; weekday++) {
            let dayDate = new Date(currentDate);
            let isToday = false;
            dayDate.setDate(currentDate.getDate() + weekday);
            if (dayDate.toDateString() === today.toDateString()) {
                isToday = true;
            }
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
                    row.push({ start: weekday + 1, end: weekday + 2, value, isToday });
                }
            });
        }
        Object.entries(rows).forEach(([key, list]) => {
            for (var item of list) {
                let classes = ["widget-schedule-" + key];
                if (item.isToday) {
                    classes.push(["today"]);
                }
                let styles = { "grid-column-start": item.start, "grid-column-end": item.end };
                let attributes = {};
                let bg_classes = [];
                bg_classes.push(classes, "background");
                html += me.item(bg_classes, styles, attributes);
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
        me.core.property.set(object.var.grid, "ui.basic.html", html);
    };
    me.click = function (object, index) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.event) {
            var event = widget.schedule_events[index];
            me.core.property.set(widget, widget.schedule_methods.event, event);
        }
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
    me.previous = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.previous) {
            me.core.property.set(widget, widget.schedule_methods.previous);
        }
    };
    me.next = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.next) {
            me.core.property.set(widget, widget.schedule_methods.next);
        }
    };
};
