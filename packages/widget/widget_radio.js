/*
 @author Zakai Hamilton
 @component WidgetRadio
 */

package.widget.radio = function WidgetRadio(me) {
    me.depends = {
        properties:["state", "group"]
    };
    me.default = {
        "ui.basic.tag" : "div"
    };
    me.create = function(object) {
        me.ui.element.create([{
            "ui.basic.var":"input",
            "ui.basic.tag":"input",
            "ui.basic.type":"radio",
            "ui.style.position":"relative",
            "ui.style.opacity":0,
            "ui.style.class":"widget.radio.original",
            "ui.basic.elementId": me.ui.element.to_path(object)
        },
        {
            "ui.basic.var":"radio",
            "ui.basic.tag":"label",
            "ui.basic.htmlFor": me.ui.element.to_path(object),
            "ui.style.position":"relative",
            "ui.style.class":"widget.radio.icon",
            "ui.basic.elements" : {
                "ui.basic.var" : "label",
                "ui.basic.tag":"span",
                "ui.style.position":"relative",
                "ui.style.class":"widget.radio.label"
            }
        }], object);
        me.ui.element.set(object, "ui.basic.label", me.ui.element.to_object(object.radio).label);
    };
    me.state = {
        get : function(object) {
            return me.ui.element.to_object(object.input).checked;
        },
        set : function(object, value) {
            me.ui.element.to_object(object.input).checked = value;
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
