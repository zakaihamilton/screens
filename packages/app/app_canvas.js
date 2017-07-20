/*
 @author Zakai Hamilton
 @component AppEditor
 */

package.app.canvas = function AppEditor(me) {
    me.launch = function () {
        if(me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__);
    };
    me.pos = {
        get: function(object) {
            var abs_region = me.ui.rect.absolute_region(object);
            var rel_region = me.ui.rect.relative_region(object);
            return rel_region.left + "x" + rel_region.top +
                    "(" + abs_region.left + "x" + abs_region.top + ")";
        }
    };
};
