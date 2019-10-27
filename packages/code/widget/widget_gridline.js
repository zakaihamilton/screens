/*
 @author Zakai Hamilton
 @component WidgetGridLine
 */

screens.widget.gridline = function WidgetGridLine(me, { core }) {
    me.element = {
        dependencies: {
            properties: ["line"]
        },
        properties: {
            "ui.basic.tag": "div",
            "ui.property.style": {
                "position": "absolute",
                "width": "100%",
                "height": "100%"
            },
            "color": "black",
            "borderStyle": "solid"
        }
    };
    me.init = function () {
        core.property.set(me, {
            "core.property.object.color": null,
            "core.property.object.borderStyle": null
        });
    };
    me.line = {
        get: function (object) {
            var row = core.property.get(object, "ui.style.gridRow");
            var column = core.property.get(object, "ui.style.gridColumn");
            return row + " " + column;
        },
        set: function (object, value) {
            var coords = value.split(" ");
            var borderLeft = false, borderTop = false, borderRight, borderBottom = false;
            var firstPoint, secondPoint, thirdPoint;
            if (coords.length > 4) {
                firstPoint = [coords[0], coords[1]];
                secondPoint = [coords[2], coords[3]];
                thirdPoint = [coords[4], coords[5]];
            }
            else {
                firstPoint = [coords[0], coords[1]];
                secondPoint = thirdPoint = [coords[2], coords[3]];
            }
            core.property.set(object, "ui.style.gridRow", firstPoint[1] + "/" + thirdPoint[1]);
            core.property.set(object, "ui.style.gridColumn", firstPoint[0] + "/" + thirdPoint[0]);
            var color = core.property.get(object, "color");
            var borderStyle = core.property.get(object, "borderStyle");
            borderLeft = firstPoint[0] === secondPoint[0];
            borderTop = firstPoint[1] === secondPoint[1];
            borderRight = secondPoint[0] === thirdPoint[1];
            borderBottom = secondPoint[1] === thirdPoint[1] && firstPoint[1] !== thirdPoint[1];
            if (borderLeft) {
                core.property.set(object, "ui.style.borderLeft", "1px " + borderStyle + " " + color);
            }
            if (borderRight) {
                core.property.set(object, "ui.style.borderRight", "1px " + borderStyle + " " + color);
            }
            if (borderTop) {
                core.property.set(object, "ui.style.borderTop", "1px " + borderStyle + " " + color);
            }
            if (borderBottom) {
                core.property.set(object, "ui.style.borderBottom", "1px " + borderStyle + " " + color);
            }
        }
    };
};
