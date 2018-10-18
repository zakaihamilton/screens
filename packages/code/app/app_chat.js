/*
 @author Zakai Hamilton
 @component AppChat
 */

screens.app.chat = function AppChat(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            if(me.core.property.get(me.singleton, "temp")) {
                me.core.property.set(me.singleton, "fullscreen", false);
                me.core.property.set(me.singleton, "nobar", false);
                me.core.property.set(me.singleton, "temp", false);
            }
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        return me.singleton;
    };
};
