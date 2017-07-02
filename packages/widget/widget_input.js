/*
 @author Zakai Hamilton
 @component WidgetInput
 */

package.widget.input = function WidgetInput(me) {
    me.depends = {
        properties:["ui.basic.text","widget.input.maxlength"]
    };
    me.redirect = {
        "ui.basic.text":"widget.input.text"
    };
    me.class="widget.input.normal";
    me.default = {
        "ui.basic.tag" : "input",
        "ui.basic.type" : "text"
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
