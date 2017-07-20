/*
 @author Zakai Hamilton
 @component AppTransform
 */

package.app.transform = function AppTransform(me) {
    me.launch = function () {
        if(me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "body", "self");
    };
    me.options = {
        "translation": true,
        "colors": true,
        "keepSource": true
    };
    me.translation = me.ui.property.toggleOptionSet(me.options, "translation");
    me.colors = me.ui.property.toggleOptionSet(me.options, "colors");
    me.keepSource = me.ui.property.toggleOptionSet(me.options, "keepSource");
    me.new = {
        set: function(object) {
            console.log("me.singleton.var.input: " + me.singleton.var.input);
            me.set(me.singleton.var.input, "ui.basic.text", "");
            me.set(me.singleton.var.output, "ui.basic.text", "");
        }
    };
    me.convert = {
        set: function(object) {
            
        }
    };
};
