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
};
