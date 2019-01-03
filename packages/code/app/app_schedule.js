/*
 @author Zakai Hamilton
 @component AppSchedule
 */

screens.app.schedule = function AppSchedule(me) {
    me.init = async function () {
        me.groupListData = await me.media.file.groups();
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
        me.core.property.set(window.var.container, "ui.style.overflow", "hidden");
        window.currentDate = new Date();
        me.ui.options.load(me, window, {
            "viewType": "Week",
            group: ""
        });
        me.ui.options.choiceSet(me, null, {
            "viewType": me.refresh,
            "group": me.refresh
        });
        await me.refresh(window);
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.schedule, "group", window.options.group);
        me.core.property.set(window.var.schedule, "type", window.options.viewType);
        me.core.property.set(window.var.schedule, "current", window.currentDate);
        me.core.property.set(window.var.schedule, "redraw");
    };
    me.event = function (object, event) {
        me.core.app.launch("player", event.group, event.session);
    };
    me.previous = function (object) {
        var window = me.widget.window.get(object);
        window.currentDate = me.core.property.get(window.var.schedule, "previousDate");
        me.refresh(object);
    };
    me.next = function (object) {
        var window = me.widget.window.get(object);
        window.currentDate = me.core.property.get(window.var.schedule, "nextDate");
        me.refresh(object);
    };
    me.today = function (object) {
        var window = me.widget.window.get(object);
        window.currentDate = new Date();
        me.refresh(object);
    };
    me.groupMenuList = {
        get: function (object) {
            var info = {
                list: me.groupListData,
                property: "name",
                attributes: { "state": "select" },
                group: "group",
                itemMethod: "app.schedule.group"
            };
            return me.widget.menu.collect(object, info);
        }
    };
};
