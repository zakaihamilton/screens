/*
 @author Zakai Hamilton
 @component WidgetProgress
 */

screens.widget.progress = function WidgetProgress(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "container",
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "background",
                    "ui.basic.var": "background"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "bar",
                    "ui.basic.var": "bar"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "handle",
                    "ui.basic.var": "handle"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "label",
                    "ui.basic.var": "label"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "percent",
                    "ui.basic.var": "percent"
                }
            ]
        }
    };
    me.min = {
        get: function (object) {
            return object.min;
        },
        set: function (object, value) {
            object.min = value;
        }
    };
    me.max = {
        get: function (object) {
            return object.max;
        },
        set: function (object, value) {
            object.max = value;
        }
    };
    me.value = {
        get: function (object) {
            return object.value;
        },
        set: function (object, value) {
            if (value < object.min) {
                value = object.min;
            }
            else if (value > object.max) {
                value = object.max;
            }
            object.value = value;
            me.update(object);
        }
    };
    me.label = {
        get: function (object) {
            return object.label;
        },
        set: function (object, label) {
            object.label = label;
            me.update(object);
        }
    };
    me.showPercentage = {
        get: function (object) {
            return me.core.property.set(object.var.percent, "ui.basic.show");
        },
        set: function (object, show) {
            me.core.property.set(object.var.percent, "ui.basic.show", show);
        }
    };
    me.update = function (object) {
        if (!object.min) {
            object.min = 0;
        }
        var percent = (object.value - object.min) / (object.max - object.min) * 100;
        me.core.property.set(object.var.percent, "ui.basic.text", parseInt(percent) + "%");
        me.core.property.set(object.var.label, "ui.basic.text", object.label);
        me.core.property.set(object.var.bar, "ui.style.width", percent + "%");
        if (percent > 99) {
            percent = 99;
        }
        me.core.property.set(object.var.handle, "ui.style.left", percent + "%");
    };
};
