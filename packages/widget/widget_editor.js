/*
 @author Zakai Hamilton
 @component WidgetEditor
 */

package.widget.editor = function WidgetEditor(me) {
    me.default = {
        "ui.basic.tag": "textarea",
        "ui.class.class": "border"
    };
    me.redirect = {
        "ui.basic.text":"text"
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
