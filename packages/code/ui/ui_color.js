/*
 @author Zakai Hamilton
 @component UIColor
 */

screens.ui.color = function UIColor(me) {
    me.lookup = {
        get: function (object, value, property) {
            return me.get(property);
        },
        set: function (object, value, property) {
            if (typeof value !== "undefined") {
                me.set(property, value);
            }
        }
    };
    me.get = function (name) {
        return document.body.style.getPropertyValue(name);
    };
    me.set = function (name, color) {
        document.body.style.setProperty(name, color);
    };
    me.colors = ["#a7309f",
        "#c0d547",
        "#005dc4",
        "#718500",
        "#c4a1ff",
        "#01a76d",
        "#ad0072",
        "#bf4a0f",
        "#ff7ba3",
        "#6a0003",
        "red",
        "blue",
        "green",
        "yellow",
        "darkgray",
        "brown"
    ];
    me.contrastColor = function (color) {
        color = (color) ? color.replace("#", "") : "";
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq;
    };
};
