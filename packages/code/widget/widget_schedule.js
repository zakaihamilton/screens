/*
 @author Zakai Hamilton
 @component WidgetSchedule
 */

screens.widget.schedule = function WidgetSchedule(me, packages) {
    const { core } = packages;
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
    me.current = {
        get: function (object) {
            return object.schedule_date;
        },
        set: function (object, date) {
            object.schedule_date = date;
        }
    };
    me.options = {
        get: function (object) {
            return object.schedule_options;
        },
        set: function (object, options) {
            object.schedule_options = options;
        }
    };
    me.size = function (object) {
        var size = { days: 1, weeks: 1, months: 1 };
        var type = object.schedule_options.viewType.toLowerCase();
        if (type === "year") {
            size.days = 7 * 5 * 11;
            size.weeks = 5 * 11;
            size.months = 11;
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
        var type = object.schedule_options.viewType.toLowerCase();
        if (type === "year") {
            date.setMonth(0);
            date.setDate(1);
        }
        else if (type === "month") {
            date.setDate(1);
        }
        if (type !== "day") {
            var firstDay = object.schedule_options.firstDay.toLowerCase();
            var day = date.getDay();
            var diff = date.getDate() - day;
            if (firstDay === "saturday") {
                if (day >= 6) {
                    diff = date.getDate() - day + 6;
                }
                else {
                    diff = date.getDate() - day - 1;
                }
            } else if (firstDay === "monday") {
                diff = date.getDate() - day + 1;
            }
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
        var query = {
            start,
            end
        };
        var events = await me.manager.schedule.events(query);
        events = events.sort((a, b) => a.name.localeCompare(b.name));
        object.schedule_events = events;
        return events;
    };
    me.formatDate = function (date) {
        var year = String(date.getFullYear());
        var month = String((date.getMonth() + 1));
        if (month.length < 2) {
            month = "0" + month;
        }
        var day = String(date.getDate());
        if (day.length < 2) {
            day = "0" + day;
        }
        var string = year + "-" + month + "-" + day;
        return string;
    };
    me.redraw = async function (object) {
        var type = object.schedule_options.viewType.toLowerCase();
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
        object.var.grid.scrollTop = 0;
        var positions = me.ui.scroll.positions.get(object);
        var region = me.ui.rect.absoluteRegion(object);
        for (let month = 0; month < monthCount; month++) {
            html += me.ui.html.item({
                classes: ["widget-schedule-month-grid", type]
            }, () => {
                return me.ui.html.item({
                    classes: ["widget-schedule-month-grid", type]
                }, () => {
                    var html = "";
                    for (let week = 0; week < weekCount; week++) {
                        html += me.ui.html.item({
                            classes: ["widget-schedule-week-grid", type],
                            styles: { width: region.width + "px", height: region.height + "px" }
                        }, () => {
                            var html = "";
                            var rows = {};
                            for (let weekday = 0; weekday < weekdayCount; weekday++) {
                                let dayDate = new Date(currentDate);
                                let isToday = false;
                                dayDate.setMonth(currentDate.getMonth() + month);
                                dayDate.setDate(currentDate.getDate() + (week * 7) + weekday);
                                if (dayDate.toDateString() === today.toDateString()) {
                                    isToday = true;
                                }
                                Object.entries({ month: "long", year: "numeric", day: "numeric", weekday: "long" }).forEach(([key, type]) => {
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
                                        row.push({ start: weekday + 1, end: weekday + 2, value, date: dayDate, isToday });
                                    }
                                });
                            }
                            Object.entries(rows).forEach(([key, list]) => {
                                for (var item of list) {
                                    let classes = ["widget-schedule-" + key, type];
                                    if (item.isToday) {
                                        classes.push(["today"]);
                                    }
                                    let styles = { "grid-column-start": item.start, "grid-column-end": item.end };
                                    let attributes = {};
                                    if (key === "day") {
                                        var dateAsString = me.formatDate(item.date);
                                        attributes.onclick = "screens.ui.clipboard.copy('" + dateAsString + "')";
                                    }
                                    html += me.ui.html.item({ classes, styles, attributes, value: item.value });
                                }
                            });
                            for (let weekday = 0; weekday < weekdayCount; weekday++) {
                                let dayDate = new Date(currentDate);
                                dayDate.setMonth(currentDate.getMonth() + month);
                                dayDate.setDate(currentDate.getDate() + (week * 7) + weekday);
                                html += me.ui.html.item({
                                    classes: ["widget-schedule-events-grid", type],
                                    styles: { "grid-column": (weekday + 1) }
                                }, () => {
                                    var html = "";
                                    var matches = {};
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
                                        if (object.schedule_options.group && object.schedule_options.group.toLowerCase() !== event.group.toLowerCase()) {
                                            continue;
                                        }
                                        let list = matches[event.name];
                                        if (!list) {
                                            list = matches[event.name] = [];
                                        }
                                        event.eventIndex = eventIndex;
                                        list.push(event);
                                    }
                                    if (matches) {
                                        for (let name in matches) {
                                            let classes = ["widget-schedule-event", type];
                                            html += me.ui.html.item({ classes }, () => {
                                                let html = "";
                                                let classes = ["widget-schedule-event-name", type];
                                                var label = name.split(" - ").join("<br>");
                                                html += me.ui.html.item({ classes, value: label });
                                                classes = ["widget-schedule-apps", type];
                                                html += me.ui.html.item({ classes }, () => {
                                                    var html = "";
                                                    for (let event of matches[name]) {
                                                        let classes = ["widget-schedule-app", type];
                                                        let attributes = {
                                                            "onclick": "screens.widget.schedule.click(this," + event.eventIndex + ")"
                                                        };
                                                        html += me.ui.html.item({ classes, attributes, value: event.app });
                                                    }
                                                    return html;
                                                });
                                                return html;
                                            });
                                        }
                                    }
                                    return html;
                                });
                            }
                            return html;
                        });
                    }
                    return html;
                });
            });
        }
        core.property.set(object.var.grid, "ui.basic.html", html);
        me.ui.scroll.positions.set(object, positions);
    };
    me.click = function (object, index) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.event) {
            var event = widget.schedule_events[index];
            core.property.set(widget, widget.schedule_methods.event, event);
        }
    };
    me.previous = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.previous) {
            core.property.set(widget, widget.schedule_methods.previous);
        }
    };
    me.next = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.next) {
            core.property.set(widget, widget.schedule_methods.next);
        }
    };
    me.today = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (widget.schedule_methods.next) {
            core.property.set(widget, widget.schedule_methods.today);
        }
    };
};
