/*
 @author Zakai Hamilton
 @component WidgetDropdown
 */

screens.widget.dropdown = function WidgetDropDown(me) {
    me.redirect = {
        "ui.basic.text": "text",
        "ui.basic.readOnly": "readOnly",
        "ui.monitor.change":"monitorChange"
    };
    me.properties = {
        "ui.class.class": "group",
        "ui.basic.elements": [
            {
                "ui.element.component":"widget.input",
                "ui.basic.text": "",
                "ui.basic.type":"text",
                "ui.basic.var": "selection",
                "ui.class.class": "selection",
                "ui.basic.readOnly":true,
                "ui.touch.click": "dropdown"
            },
            {
                "ui.class.class": "button",
                "ui.touch.click": "dropdown",
                "ui.basic.elements": [
                    {
                        "ui.class.class": "button.arrow"
                    },
                    {
                        "ui.class.class": "button.line"
                    }
                ]
            }
        ]
    };
    me.readOnly = {
        get: function (object) {
            return me.core.property.get(object.var.selection, "ui.basic.readOnly");
        },
        set: function (object, value) {
            me.core.property.set(object.var.selection, "ui.basic.readOnly", value);
            me.core.property.set(object.var.selection, "ui.touch.click", value ? null : "dropdown");
        }
    };
    me.text = {
        get: function (object) {
            return me.core.property.get(object.var.selection, "ui.basic.text");
        },
        set: function (object, value) {
            me.core.property.set(object.var.selection, "ui.basic.text", value);
        }
    };
    me.monitorChange = {
        set: function (object, value) {
            me.core.property.set(object.var.selection, "ui.monitor.change", value);
        }
    };
};
