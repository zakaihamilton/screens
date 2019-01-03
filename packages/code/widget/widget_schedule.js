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
                    "ui.class.class": ["nav", "today"],
                    "ui.basic.html": "Today",
                    "ui.touch.click": "today"
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
    me.type = {
        get: function (object) {
            return object.schedule_type;
        },
        set: function (object, type) {
            object.schedule_type = type;
        }
    };
    me.current = {
        get: function (object) {
            return object.schedule_date;
        },
        set: function (object, date) {
            object.schedule_date = date;
        }
    };
    me.group = {
        get: function (object) {
            return object.schedule_group;
        },
        set: function (object, group) {
            object.schedule_group = group;
        }
    };
    me.size = function (object) {
        var size = { days: 1, weeks: 1, months: 1 };
        var type = object.schedule_type.toLowerCase();
        if (type === "year") {
            size.days = 7 * 5 * 12;
            size.weeks = 5 * 12;
            size.months = 12;
        } else if (type === "month") {
            size.days = 7 * 5;
            size.weeks = 5;
            size.months = 1;
        } else if (type === "week") {
            size.days = 7;
            size.weeks = 1;
            size.months = 1;
        }
        return size;
    };
    me.nextDate = function (object) {
        var size = me.size(object);
        var date = new Date(object.schedule_date.getTime());
        date.setDate(object.schedule_date.getDate() + size.days);
        return date;
    };
    me.previousDate = function (object) {
        var size = me.size(object);
        var date = new Date(object.schedule_date.getTime());
        date.setDate(object.schedule_date.getDate() - size.days);
        return date;
    };
    me.first = function (object) {
        var date = new Date(object.schedule_date.getTime());
        var type = object.schedule_type.toLowerCase();
        if (type === "year") {
            date.setMonth(0);
            date.setDate(1);
        }
        else if (type === "month") {
            date.setDate(1);
        }
        if (type !== "day") {
            var day = date.getDay(),
                diff = date.getDate() - day;
            date.setDate(diff);
        }
        return date;
    };
    me.events = async function (object) {
        var size = me.size(object);
        var date = me.first(object);
        var start = {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate()
        };
        date.setDate(date.getDate() + size.days);
        var end = {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate()
        };
        var events = await me.manager.schedule.events(start, end);
        object.schedule_events = events;
        return events;
    };
    me.redraw = async function (object) {
        var size = me.size(object);
        var events = await me.events(object);
        if (!events) {
            events = [];
        }
        var html = "";
        var today = new Date();
        var currentDate = me.first(object);
        var weekdayCount = size.days;
        if (weekdayCount > 7) {
            weekdayCount = 7;
        }
        var weekCount = size.weeks;
        if (weekCount > 5) {
            weekCount = 5;
        }
        var monthCount = size.months;
        if (monthCount > 11) {
            monthCount = 11;
        }
        for (let month = 0; month < monthCount; month++) {
            html += "<div class=\"widget-schedule-month-grid\">";
            for (let week = 0; week < weekCount; week++) {
                html += "<div class=\"widget-schedule-week-grid\">";
                var rows = {};
                for (let weekday = 0; weekday < weekdayCount; weekday++) {
                    let dayDate = new Date(currentDate);
                    let isToday = false;
                    dayDate.setMonth(currentDate.getMonth() + month);
                    dayDate.setDate(currentDate.getDate() + (week * 7) + weekday);
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
                        bg_classes.push(...classes, "background");
                        html += me.item(bg_classes, styles, attributes);
                        html += me.item(classes, styles, attributes, item.value);
                    }
                });
                for (let weekday = 0; weekday < weekdayCount; weekday++) {
                    let rowIndex = 5;
                    let dayDate = new Date(currentDate);
                    dayDate.setMonth(currentDate.getMonth() + month);
                    dayDate.setDate(currentDate.getDate() + (week * 7) + weekday);
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
                        if (object.schedule_group && object.schedule_group.toLowerCase() !== event.group.toLowerCase()) {
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
                html += "</div>";
            }
            html += "</div>";
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
    me.today = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.next) {
            me.core.property.set(widget, widget.schedule_methods.today);
        }
    };
};
