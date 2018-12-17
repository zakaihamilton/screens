/*
 @author Zakai Hamilton
 @component WidgetSpinner
 */

screens.widget.spinner = function WidgetSpinner(me) {
    me.element = {
        properties: {
            "ui.class.class": "loader",
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "span",
                    "ui.basic.var":"text",
                    "ui.basic.text": "Loading"
                },
                {
                    "ui.basic.tag":"div",
                    "ui.class.class":"spinner"
                }
            ]
        }
    };
    me.percent = function(object, value) {
        me.core.property.set(object.var.text, "ui.basic.text", object.spinner_text + " " + value + "%");
    };
    me.text = function(object, value) {
        object.spinner_text = value;
        me.core.property.set(object.var.text, "ui.basic.text", value);
    };
};
