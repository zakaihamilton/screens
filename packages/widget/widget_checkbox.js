/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

package.widget.checkbox = function WidgetCheckBox(me) {
    me.depends = {
        properties: ["state"]
    };
    me.tag_name = "div";
    me.create = function (object) {
        me.ui.element.create([{
                "var": "input",
                "tag_name": "input",
                "widget.checkbox.type": "checkbox",
                "ui.style.position": "relative",
                "ui.style.opacity": 0,
                "ui.style.class": "widget.checkbox.original",
                "widget.checkbox.elementId": object.path
            },
            {
                "var": "checkbox",
                "tag_name": "label",
                "widget.checkbox.htmlFor": object.path,
                "ui.style.position": "relative",
                "ui.style.class": "widget.checkbox.icon",
                "elements": {
                    "var": "label",
                    "tag_name": "span",
                    "ui.style.position": "relative",
                    "ui.style.class": "widget.checkbox.label"
                }
            }], object);
    };
    me.elementId = {
        get : function(object) {
            return me.ui.element.to_object(object).id;
        },
        set : function(object, value) {
            me.ui.element.to_object(object).id = value;
        }
    };
    me.htmlFor = {
        get : function(object) {
            return me.ui.element.to_object(object).htmlFor;
        },
        set : function(object, value) {
            me.ui.element.to_object(object).htmlFor = value;
        }
    };
    me.type = {
        get : function(object) {
            return me.ui.element.to_object(object).type;
        },
        set : function(object, value) {
            me.ui.element.to_object(object).type = value;
        }
    };
    me.state = {
        get : function(object) {
            return me.ui.element.to_object(object.input).checked;
        },
        set : function(object, value) {
            me.ui.element.to_object(object.input).checked = value;
        }
    };
    me.text = {
        get : function(object) {
            return me.ui.element.to_object([object.checkbox, "label"]).innerHTML;
        },
        set : function(object, value) {
            me.ui.element.to_object([object.checkbox, "label"]).innerHTML = value;
        }
    };
};
