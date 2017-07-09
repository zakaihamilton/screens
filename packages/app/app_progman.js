/*
 @author Zakai Hamilton
 @component AppProgman
 */

package.app.progman = function AppProgman(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        if(me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "ui.focus.active", true);
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__);
        console.log("me.progman: " + me.singleton);
    };
    me.check = {
        get: function (object) {
            return me.checked;
        },
        set: function (object, value) {
            me.checked = !me.checked;
        }
    };
};
