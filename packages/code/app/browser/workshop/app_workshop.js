/*
 @author Zakai Hamilton
 @component AppWorkshop
 */

screens.app.workshop = function AppWorkshop(me, { core }) {
    me.init = async function () {
        await me.ui.shared.implement(me);
    };
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        await me.prepare(me.singleton);
        return me.singleton;
    };
    me.prepare = async function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window, "app", me);
        core.property.set(window.var.users, {
            "navigate": "app.workshop.navigate",
            "options": {
                spreaderInTitle: "Workshop",
                spreaderOutTitle: "Workshop",
                spreaderRadius: 100,
                titleFont: "100 1em Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif",
                spreaderTitleFont: "100 2em Impact, Charcoal, sans-serif"
            }
        });
        me.ui.options.load(me, window, {
            autoRefresh: true,
            shuffle: true,
            filter: false,
            test: false,
            broadcast: false,
            userName: ""
        });
        me.ui.options.choiceSet(me, null, {
            "userName": me.updateUser
        });
        me.ui.options.toggleSet(me, null, {
            "autoRefresh": me.refresh,
            "shuffle": me.refresh,
            "filter": me.refresh,
            "test": me.refresh,
            "broadcast": me.refresh
        });
        window.isBroadcast = true;
        await me.refresh(window);
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        var names = await me.lib.zoom.participants(window.options.shuffle, window.options.test);
        if (window.options.filter) {
            names = names.filter(name => !name.toLowerCase().includes("listen"));
        }
        core.property.set(window, "name", names.length + " Participants");
        var currentNames = core.property.get(window.var.users, "items");
        if (JSON.stringify(names) !== JSON.stringify(currentNames)) {
            core.property.set(window.var.users, {
                "items": names,
                "redraw": null
            });
        }
        me.shared.refresh();
        me.updateUser(window);
        if (window.options.autoRefresh) {
            clearTimeout(window.intervalHandle);
            window.intervalHandle = setTimeout(() => {
                requestAnimationFrame(() => {
                    me.refresh(object);
                });
            }, 5000);
        }
    };
    me.resize = function (object) {
        var window = me.widget.window.get(object);
        me.ui.resize.centerWidget(window.var.users);
    };
    me.updateUser = async function (object) {
        var window = me.widget.window.get(object);
        var content = await me.shared.content(object);
        var readonly = true;
        if (content === undefined) {
            content = { name: window.navigate_name };
            readonly = false;
        }
        core.property.set(window.var.users, "readonly", readonly);
        if (content.name) {
            core.property.set(window.var.users, "user", content.name);
        }
        if (!window.options.broadcast) {
            if (window.isBroadcast) {
                me.shared.update();
            }
            window.isBroadcast = false;
        }
    };
    me.navigate = function (object, name) {
        var window = me.widget.window.get(object);
        window.navigate_name = name;
        if (window.options.broadcast) {
            window.isBroadcast = true;
            me.shared.update({ name: window.navigate_name });
        }
    };
};
