/*
 @author Zakai Hamilton
 @component WidgetInput
 */

screens.widget.input = function WidgetInput(me) {
    me.dependencies = {
        properties:["ui.basic.text","ui.basic.type"]
    };
    me.redirect = {
        "ui.basic.text":"text"
    };
    me.properties = {
        "ui.basic.tag" : "input",
        "ui.class.class" : "normal",
        "ui.attribute.tabindex":"0"
    };
    me.text = {
        get: function(object) {
            return object.value;
        },
        set: function(object, value) {
            object.value = value;
        }
    };
    me.maxlength = {
        get: function(object) {
            return object.maxlength;
        },
        set: function(object, value) {
            object.maxlength = value;
        }
    };
};
