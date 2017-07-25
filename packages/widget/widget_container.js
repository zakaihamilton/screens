/*
 @author Zakai Hamilton
 @component WidgetContainer
 */

package.widget.container = function WidgetContainer(me) {
    me.redirect = {
        "ui.basic.elements": "elements"
    };
    me.default = __json__;
    me.content = function (object) {
        return object.var.content;
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.ui.element.create(value, object.var.content, object.context);
            }
        }
    };
    me.update = {
        set: function(object, value) {
            setTimeout( function() {
                me.set(object.var.vertical, "update");
                me.set(object.var.horizontal, "update");
            }, 0);
        }
    };
};
