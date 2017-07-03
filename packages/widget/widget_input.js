/*
 @author Zakai Hamilton
 @component WidgetInput
 */

package.widget.input = function WidgetInput(me) {
    me.depends = {
        properties:["ui.basic.text","ui.basic.type"]
    };
    me.redirect = {
        "ui.basic.text":"widget.input.text"
    };
    me.default = {
        "ui.basic.tag" : "input",
        "ui.theme.class" : "widget.input.normal"
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
