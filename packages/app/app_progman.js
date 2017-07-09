/*
 @author Zakai Hamilton
 @component AppProgman
 */

package.app.progman = function AppProgman(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        console.log("me.progman:" + me.progman);
        if(me.get(me.progman, "ui.node.parent")) {
            me.set(me.progman, "ui.focus.active", true);
            me.set(me.progman, "widget.window.show", true);
            return;
        }
        me.progman = me.ui.element.create(__json__);
        console.log("me.progman: " + me.progman);
    };
    me.check = {
        get: function (object) {
            var options = {"state": me.checked};
            return options;
        },
        set: function (object, value) {
            me.checked = !me.checked;
        }
    };
};
