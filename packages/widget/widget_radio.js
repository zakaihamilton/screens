/*
 @author Zakai Hamilton
 @component WidgetRadio
 */

package.widget.radio = function WidgetRadio(me) {
    me.depends = {
        properties: ["state", "group"]
    };
    me.alias = {
        "ui.basic.text" : "widget.radio.text"
    };
    me.default = {
        "ui.basic.tag": "div"
    };
    me.create = {
        set: function (object) {
            var ref = me.core.ref.gen();
            me.ui.element.create([{
                    "ui.basic.var": "input",
                    "ui.basic.tag": "input",
                    "ui.basic.type": "radio",
                    "ui.style.position": "relative",
                    "ui.style.opacity": 0,
                    "ui.theme.class": "widget.radio.original",
                    "ui.basic.elementId": ref
                },
                {
                    "ui.basic.var": "radio",
                    "ui.basic.tag": "label",
                    "ui.basic.htmlFor": ref,
                    "ui.style.position": "relative",
                    "ui.theme.class": "widget.radio.icon",
                    "ui.basic.elements": {
                        "ui.basic.var": "label",
                        "ui.basic.tag": "span",
                        "ui.style.position": "relative",
                        "ui.theme.class": "widget.radio.label"
                    }
                }], object);
        }
    };
    me.state = {
        get: function (object) {
            return object.var.input.checked;
        },
        set: function (object, value) {
            object.var.input.checked = value;
        }
    };
    me.group = {
        get: function (object) {
            return object.var.input.name;
        },
        set: function (object, value) {
            object.var.input.name = value;
        }
    };
    me.text = {
        get: function (object) {
            return object.var.label.innerHTML;
        },
        set: function(object, value) {
            object.var.label.innerHTML = value;
        }
    };
};
