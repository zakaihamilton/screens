/*
 @author Zakai Hamilton
 @component AppSchedule
 */

screens.app.schedule = function AppSchedule(me, { core, app, ui, widget }) {
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.groupListData = app.player.groups;
        me.singleton = ui.element.create(me.json, "workspace", "self");
        await me.prepare(me.singleton);
        return me.singleton;
    };
    me.prepare = async function (object) {
        var window = widget.window.get(object);
        core.property.set(window, "app", me);
        core.property.set(window.var.container, "ui.style.overflow", "hidden");
        window.currentDate = new Date();
        ui.options.load(me, window, {
            "viewType": "Week",
            "firstDay": "Saturday",
            group: ""
        });
        ui.options.choiceSet(me, null, {
            "viewType": me.refresh,
            "firstDay": me.refresh,
            "group": me.refresh
        });
        await me.refresh(window);
    };
    me.reset = async function (object) {
        me.refresh(object);
    };
    me.refresh = async function (object) {
        var window = widget.window.get(object);
        if (core.property.get(window, "ui.work.state")) {
            return;
        }
        core.property.set(window, "ui.work.state", true);
        core.property.set(window.var.schedule, "options", window.options);
        core.property.set(window.var.schedule, "current", window.currentDate);
        await core.property.set(window.var.schedule, "redraw");
        core.property.set(window, "ui.work.state", false);
    };
    me.event = function (object, event) {
        core.app.launch.apply(null, event.launch);
    };
    me.previous = function (object) {
        var window = widget.window.get(object);
        window.currentDate = core.property.get(window.var.schedule, "previousDate");
        me.refresh(object);
    };
    me.next = function (object) {
        var window = widget.window.get(object);
        window.currentDate = core.property.get(window.var.schedule, "nextDate");
        me.refresh(object);
    };
    me.today = function (object) {
        var window = widget.window.get(object);
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
            return widget.menu.collect(object, info);
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
                    core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                    core.property.set([object.var.schedule], "ui.style.visibility", "hidden");
                }, 250);
            } else {
                core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                core.property.set([object.var.schedule], "ui.style.visibility", "visible");
            }
        }
    };
};
