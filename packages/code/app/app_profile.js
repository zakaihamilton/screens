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
    me.html = function() {
        return __html__;
    };
};
