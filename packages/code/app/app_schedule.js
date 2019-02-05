/*
 @author Zakai Hamilton
 @component AppSchedule
 */

screens.app.schedule = function AppSchedule(me) {
    me.launch = async function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.groupListData = await me.media.file.groups();
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
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
            "firstDay": "Saturday",
            group: ""
        });
        me.ui.options.choiceSet(me, null, {
            "viewType": me.refresh,
            "firstDay": me.refresh,
            "group": me.refresh
        });
        await me.refresh(window);
    };
    me.reset = async function (object) {
        await me.manager.content.refresh();
        me.refresh(object);
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "ui.work.state", true);
        me.core.property.set(window.var.schedule, "options", window.options);
        me.core.property.set(window.var.schedule, "current", window.currentDate);
        await me.core.property.set(window.var.schedule, "redraw");
        me.core.property.set(window, "ui.work.state", false);
    };
    me.event = function (object, event) {
        me.core.app.launch.apply(null, event.launch);
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
                options: { "state": "select" },
                group: "group",
                itemMethod: "app.schedule.group"
            };
            return me.widget.menu.collect(object, info);
        }
    };
    me.resize = function (object) {
        me.refresh(object);
    };
    me.work = {
        set: function (object, value) {
            if (me.workTimeout) {
                clearTimeout(me.workTimeout);
                me.workTimeout = null;
            }
            if (value) {
                me.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                    me.core.property.set([object.var.schedule], "ui.style.visibility", "hidden");
                }, 250);
            } else {
                me.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                    me.core.property.set([object.var.schedule], "ui.style.visibility", "visible");
                }, 250);
            }
        }
    };
};
