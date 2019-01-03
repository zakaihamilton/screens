/*
 @author Zakai Hamilton
 @component AppSchedule
 */

screens.app.schedule = function AppSchedule(me) {
    me.init = async function () {

    };
    me.launch = async function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        await me.prepare(me.singleton);
        return me.singleton;
    };
    me.prepare = async function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "app", me);
        window.firstDate = new Date();
        await me.refresh(window);
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        var date = me.core.util.getSunday(window.firstDate);
        var start = {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate()
        };
        date.setDate(date.getDate() + 6);
        var end = {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate()
        };
        var events = await me.manager.schedule.events(start, end);
        me.core.property.set(window.var.schedule, "start", start);
        me.core.property.set(window.var.schedule, "events", events);
    };
    me.resize = function (object) {
        var window = me.widget.window.get(object);
        //me.ui.resize.centerWidget(window.var.users);
    };
    me.event = function (object, event) {
        me.core.app.launch("player", event.group, event.session);
    };
    me.previous = function (object) {
        var window = me.widget.window.get(object);
        window.firstDate.setDate(window.firstDate.getDate() - 7);
        me.refresh(object);
    };
    me.next = function (object) {
        var window = me.widget.window.get(object);
        window.firstDate.setDate(window.firstDate.getDate() + 7);
        me.refresh(object);
    };
};
