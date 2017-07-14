/*
 @author Zakai Hamilton
 @component AppEditor
 */

package.app.editor = function AppEditor(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        if(me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__);
    };
};
