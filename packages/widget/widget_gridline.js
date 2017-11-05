/*
 @author Zakai Hamilton
 @component WidgetGridLine
 */

package.widget.gridline = function WidgetGridLine(me) {
    me.depends = {
        properties: ["line"]
    };
    me.default = {
        "ui.basic.tag": "div",
        "ui.property.style": {
            "position": "absolute",
            "width":"100%",
            "height":"100%"
        },
        "color":"black",
        "borderStyle":"solid"
    };
    me.init = function() {
        me.color = me.package.core.object.property("widget.gridline.color");
        me.borderStyle = me.package.core.object.property("widget.gridline.borderStyle");
    };
    me.line = {
        get: function(object) {
            var row = me.package.core.property.get(object, "ui.style.gridRow");
            var column = me.package.core.property.get(object, "ui.style.gridColumn");
            return row + " " + column;
        },
        set: function(object, value) {
            var coords = value.split(" ");
            var borderLeft = false, borderTop = false, borderRight, borderBottom = false;
            var firstPoint, secondPoint, thirdPoint;
            if(coords.length > 4) {
                firstPoint = [coords[0], coords[1]];
                secondPoint = [coords[2], coords[3]];
                thirdPoint = [coords[4], coords[5]];
            }
            else {
                firstPoint = [coords[0], coords[1]];
                secondPoint = thirdPoint = [coords[2], coords[3]];
            }
            me.package.core.property.set(object, "ui.style.gridRow", firstPoint[1] + "/" + thirdPoint[1]);
            me.package.core.property.set(object, "ui.style.gridColumn", firstPoint[0] + "/" + thirdPoint[0]);
            var color = me.package.core.property.get(object, "color");
            var borderStyle = me.package.core.property.get(object, "borderStyle");
            borderLeft = firstPoint[0] === secondPoint[0];
            borderTop = firstPoint[1] === secondPoint[1];
            borderRight = secondPoint[0] === thirdPoint[1];
            borderBottom = secondPoint[1] === thirdPoint[1] && firstPoint[1] !== thirdPoint[1];
            if(borderLeft) {
                me.package.core.property.set(object, "ui.style.borderLeft", "1px " + borderStyle + " " + color);
            }
            if(borderRight) {
                me.package.core.property.set(object, "ui.style.borderRight", "1px " + borderStyle + " " + color);
            }
            if(borderTop) {
                me.package.core.property.set(object, "ui.style.borderTop", "1px " + borderStyle + " " + color);
            }
            if(borderBottom) {
                me.package.core.property.set(object, "ui.style.borderBottom", "1px " + borderStyle + " " + color);
            }
        }
    };
};
