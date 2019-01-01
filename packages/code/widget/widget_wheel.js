/*
 @author Zakai Hamilton
 @component WidgetWheel
 */

screens.widget.wheel = function WidgetWheel(me) {
    me.init = async function () {
        await me.core.require.load("/external/wheelnav.js");
        await me.core.require.load("/external/raphael.min.js");
    };
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.attribute.#id": "wheel",
            "ui.style.position": "absolute"
        }
    };
    me.navigate = function (object, method) {
        object.navigate_method = method;
    };
    me.select = function (object, index) {
        var wheel = object.wheel;
        object.navigate_index = index;
        wheel.navigateWheel(index);
    };
    me.items = {
        get: function (object) {
            return object.nav_items;
        },
        set: function (object, items) {
            object.nav_items = items;
        }
    };
    me.options = {
        get: function (object) {
            return object.wheel_options;
        },
        set: function (object, options) {
            object.wheel_options = options;
        }
    };
    me.redraw = function (object) {
        var id = me.core.property.get(object, "ui.attribute.#id");
        var wheel = object.wheel = new wheelnav(id);
        wheel.slicePathFunction = slicePath().PieSlice;
        wheel.markerPathFunction = markerPath().PieLineMarker;
        wheel.markerAttr = { fill: "#333", stroke: "#333" };
        wheel.spreaderEnable = true;
        wheel.spreaderRadius = 50;
        wheel.clickModeRotate = false;
        wheel.markerEnable = true;
        wheel.animatetime = 1000;
        wheel.animateeffect = "linear";
        wheel.markerAttr = { stroke: me.ui.color.get("--color"), "stroke-width": 10 };
        wheel.currentClick = object.navigate_index;
        if (object.wheel_options) {
            for (var key in object.wheel_options) {
                wheel[key] = object.wheel_options[key];
            }
        }
        var items = object.nav_items;
        if (!items || !items.length) {
            items = [""];
        }
        wheel.createWheel(items);
        for (let navIndex = 0; navIndex < wheel.navItems.length; navIndex++) {
            wheel.navItems[navIndex].navigateFunction = function () {
                object.navigate_index = navIndex;
                if (!object.ignore_handler && object.navigate_method) {
                    me.core.property.set(object, object.navigate_method, navIndex);
                }
            };
        }
        object.ignore_handler = true;
        if (object.navigate_index) {
            wheel.navigateWheel(object.navigate_index);
        }
        object.ignore_handler = false;
    };
};
