/*
 @author Zakai Hamilton
 @component AppProfile
 */

screens.app.profile = function AppProfile(me, packages) {
    const { core } = packages;
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.userListAvailable = await me.user.access.isAPIAllowed("user.profile.list");
        if (me.userListAvailable) {
            me.userList = await me.user.profile.list();
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self", null);
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            userName: ""
        });
        me.ui.options.choiceSet(me, null, {
            "userName": me.updateUser
        });
    };
    me.phases = {
        Unformed: 1,
        Chaos: 2,
        Darkness: 3,
        Spirit: 4
    };
    me.bindings = function () {
        var ids = [
            "phaseMajor",
            "phaseMinor",
            "name",
            "email",
            "tier",
            "group",
            "mainClass",
            "subClass",
            "upper",
            "individual",
            "method",
            "externalGender",
            "internalGender"
        ];
        var bindings = {};
        for (var id of ids) {
            bindings[id] = document.getElementById("app.profile." + id);
        }
        return bindings;
    };
    me.sortUserList = function (object, items) {
        if (!items || items.then) {
            return [];
        }
        items = items.sort((a, b) => a.name.localeCompare(b.name));
        return items;
    };
    me.userMenuList = {
        get: function (object) {
            var info = {
                list: me.userList,
                property: "name",
                options: { "state": "select" },
                group: "users",
                sort: true,
                listMethod: me.sortUserList,
                itemMethod: "app.profile.userName"
            };
            return me.widget.menu.collect(object, info);
        }
    };
    me.userId = async function (object, name) {
        var userId = null;
        var list = me.userList;
        if (list && name) {
            var user = list.find((user) => name == user.name);
            if (user && user.key) {
                userId = user.key.name;
            }
        }
        return userId;
    };
    me.updateUser = async function (object) {
        var window = me.widget.window.get(object);
        var bindings = me.bindings(object);
        var userId = await me.userId(object, window.options.userName);
        var profile = await me.user.profile.get(userId);
        if (!profile) {
            profile = {};
        }
        if (!window.options.userName) {
            profile.name = core.login.userName();
            profile.email = core.login.userEmail();
        }
        for (var id in bindings) {
            if (profile[id]) {
                bindings[id].value = profile[id];
            }
        }
        me.update(object);
    };
    me.save = async function (object) {
        var window = me.widget.window.get(object);
        var bindings = me.bindings(object);
        var profile = me.data;
        if (!profile) {
            profile = {};
        }
        for (var id in bindings) {
            profile[id] = bindings[id].value;
        }
        var button = document.getElementById("app.profile.save");
        core.property.set(button, "ui.class.is_loading", true);
        var userId = await me.userId(object, window.options.userName);
        await me.user.profile.set(profile, userId);
        core.property.set(button, "ui.class.is_loading", false);
        me.data = await me.user.profile.get(userId);
    };
    me.update = function () {
        var tier = document.getElementById("app.profile.tier");
        var phaseField = document.getElementById("app.profile.phaseLabel");
        var phaseLabel = document.getElementById("app.profile.phaseField");
        var phaseMajor = document.getElementById("app.profile.phaseMajor");
        var phaseMinor = document.getElementById("app.profile.phaseMinor");
        var phaseText = document.getElementById("app.profile.phaseText");
        var text = "";
        var showPhases = true;
        if (tier.value.includes("Infinity")) {
            showPhases = false;
            phaseMajor.value = "";
            phaseMinor.value = "";
        }
        core.property.set(phaseField, "ui.basic.show", showPhases);
        core.property.set(phaseLabel, "ui.basic.show", showPhases);
        if (showPhases) {
            if (me.phases[phaseMajor.value] && me.phases[phaseMinor.value]) {
                text = me.phases[phaseMajor.value] + "." + me.phases[phaseMinor.value];
            }
        }
        phaseText.textContent = text;
    };
};
