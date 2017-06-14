/*
 @author Zakai Hamilton
 @component WidgetRadio
 */

package.widget.radio = function WidgetRadio(me) {
    me.depends = {
        properties:["state", "group"]
    };
    me.tag_name = "div";
    me.create = function(object) {
        me.ui.element.create([{
            "var":"input",
            "tag_name":"input",
            "widget.radio.type":"radio",
            "ui.style.position":"relative",
            "ui.style.opacity":0,
            "ui.style.class":"widget.radio.original",
            "widget.radio.elementId":object.path
        },
        {
            "var":"radio",
            "tag_name":"label",
            "widget.radio.htmlFor":object.path,
            "ui.style.position":"relative",
            "ui.style.class":"widget.radio.icon",
            "elements" : {
                "var" : "label",
                "tag_name":"span",
                "ui.style.position":"relative",
                "ui.style.class":"widget.radio.label"
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
            return me.ui.element.to_object([object.radio, "label"]).innerHTML;
        },
        set : function(object, value) {
            me.ui.element.to_object([object.radio, "label"]).innerHTML = value;
        }
    };
    me.group = {
        get : function(object) {
            return me.ui.element.to_object(object.input).name;
        },
        set : function(object, value) {
            me.ui.element.to_object(object.input).name = value;
        }
    };
};
