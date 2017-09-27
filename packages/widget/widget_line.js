/*
 @author Zakai Hamilton
 @component WidgetLine
 */

package.widget.line = function WidgetLine(me) {
    me.default = {
        "ui.basic.tag": "line"
    };
    me.region = {
        get: function(object) {
            var x1 = me.get(object, "ui.attribute.x1");
            var x2 = me.get(object, "ui.attribute.x2");
            var y1 = me.get(object, "ui.attribute.y1");
            var y2 = me.get(object, "ui.attribute.y2");
            return x1 + " " + y1 + " " + x2 + " " + y2;
        },
        set: function(object, value) {
            var coords = value.split(" ");
            me.set(object, "ui.attribute.x1", coords[0]);
            me.set(object, "ui.attribute.x2", coords[1]);
            me.set(object, "ui.attribute.y1", coords[2]);
            me.set(object, "ui.attribute.y2", coords[3]);
        }
    };
};
