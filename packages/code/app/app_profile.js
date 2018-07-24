/*
 @author Zakai Hamilton
 @component AppProfile
 */

screens.app.profile = function AppProfile(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self", null);
    };
    me.html = function () {
        return __html__;
    };
    me.init = async function () {
        me.data = await me.user.profile.get();
    };
    me.phases = {
        Unformed: 1,
        Chaos: 2,
        Darkness: 3,
        Spirit: 4
    };
    me.bindings = function (object) {
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
    me.load = async function (object) {
        var bindings = me.bindings(object);
        var profile = me.data;
        if (!profile) {
            profile = {};
        }
        if (!profile.name) {
            profile.name = me.lib.google.userName();
        }
        if (!profile.email) {
            profile.email = me.lib.google.userEmail();
        }
        for (var id in bindings) {
            if (profile[id]) {
                bindings[id].value = profile[id];
            }
        }
        me.update(object);
    };
    me.save = async function (object) {
        var bindings = me.bindings(object);
        var profile = me.data;
        if (!profile) {
            profile = {};
        }
        for (var id in bindings) {
            profile[id] = bindings[id].value;
        }
        var button = document.getElementById("app.profile.save");
        me.core.property.set(button, "ui.class.is_loading", true);
        await me.user.profile.set(profile);
        me.core.property.set(button, "ui.class.is_loading", false);
    };
    me.update = function (object) {
        var window = me.widget.window(object);
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
        me.core.property.set(phaseField, "ui.basic.show", showPhases);
        me.core.property.set(phaseLabel, "ui.basic.show", showPhases);
        if (showPhases) {
            if (me.phases[phaseMajor.value] && me.phases[phaseMinor.value]) {
                text = me.phases[phaseMajor.value] + "." + me.phases[phaseMinor.value];
            }
        }
        phaseText.textContent = text;
    };
};
