/*
 @author Zakai Hamilton
 @component WidgetIcon
 */

package.widget.icon = function WidgetIcon(me) {
    me.depends = {
        properties: ["ui.basic.src", "text"]
    };
    me.redirect = {
        "ui.basic.text" : "text",
        "ui.basic.src" : "src"
    };
    me.extend = ["ui.drag"];
    me.default = {
        "ui.basic.tag": "figure",
        "ui.theme.class": "figure",
        "ui.basic.elements": [{
                "ui.basic.src": "",
                "ui.theme.class": "image",
                "ui.drag.element": null,
                "ui.basic.var": "icon"
            },
            {
                "ui.basic.tag": "figcaption",
                "ui.theme.class": "caption",
                "ui.basic.var": "label"
            }]
    };
    me.text = {
        get: function (object) {
            return object.var.label.innerHTML;
        },
        set: function(object, value) {
            object.var.label.innerHTML = value;
        }
    };
    me.src = {
        get: function (object) {
            return object.var.icon.src;
        },
        set: function (object, value) {
            object.var.icon.src = value;
        }
    };
};
