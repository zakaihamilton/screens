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
        me.update(me.singleton);
    };
    me.html = function() {
        return __html__;
    };
    me.phases = {
        Unformed:1,
        Chaos:2,
        Darkness:3,
        Spirit:4
    };
    me.update = function(object) {
        var window = me.widget.window(object);
        var phaseMajor = document.getElementById("app.profile.phaseMajor");
        var phaseMinor = document.getElementById("app.profile.phaseMinor");
        var phaseText = document.getElementById("app.profile.phaseText");
        phaseText.textContent = me.phases[phaseMajor.value] + "." + me.phases[phaseMinor.value];
    };
};
