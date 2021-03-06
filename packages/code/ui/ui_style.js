/*
 @author Zakai Hamilton
 @component UIStyle
 */

screens.ui.style = function UIStyle(me, { core }) {
    me.stylesheets = {};
    me.lookup = {
        get: function (object, value, property) {
            var styles = null;
            var method = object._getComputedStyle;
            if (method) {
                styles = method(object);
            } else {
                styles = getComputedStyle(object);
            }
            return styles[property];
        },
        set: function (object, value, property) {
            if (object && typeof value !== "undefined" && object.style) {
                object.style[property] = value;
            }
        }
    };
    me.values = function (values) {
        var result = { left: 0, top: 0, right: 0, bottom: 0 };
        if (!values || !(typeof values === "string" || values instanceof String)) {
            return result;
        }
        var array = values.split(" ");
        switch (array.length) {
            case 1:
                result.left = result.top = result.right = result.bottom = array[0];
                break;
            case 2:
                result.left = result.right = array[0];
                result.top = result.bottom = array[1];
                break;
            case 3:
                result.top = array[0];
                result.left = result.right = array[1];
                result.bottom = array[2];
                break;
            case 4:
                result.top = array[0];
                result.right = array[1];
                result.bottom = array[2];
                result.left = array[3];
                break;
            default:
                break;
        }
        return result;
    };
    me.hover = {
        set: function (object, value) {
            if (value.over) {
                core.property.set(object, "ui.touch.over", () => {
                    core.property.set(object, "ui.property.style", value.over);
                });
            }
            if (value.leave) {
                core.property.set(object, "ui.touch.leave", () => {
                    core.property.set(object, "ui.property.style", value.leave);
                });
            }
        }
    };
};
