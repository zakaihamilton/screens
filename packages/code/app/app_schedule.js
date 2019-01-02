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
        await me.refresh(window);
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        var events = await me.manager.schedule.events({ year: 2018, month: 11, day: 27 }, { year: 2019, month: 0, day: 6 });
        me.core.property.set(window.var.schedule, "events", events);
    };
    me.resize = function (object) {
        var window = me.widget.window.get(object);
        //me.ui.resize.centerWidget(window.var.users);
    };
    me.link = function (object, event) {
        me.core.app.launch("app.player", event.group, event.name);
    };
};
