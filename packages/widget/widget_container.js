/*
 @author Zakai Hamilton
 @component WidgetContainer
 */

package.widget.container = function WidgetContainer(me) {
    me.redirect = {
        "ui.basic.elements": "elements"
    };
    me.default = {
        "ui.theme.class": "root",
        "ui.basic.elements": [
            {
                "ui.style.display": "flex",
                "ui.style.flex": "1",
                "ui.basic.elements": [
                    {
                        "ui.element.component":"widget.content",
                        "ui.basic.var": "content"
                    },
                    {
                        "ui.element.component": "widget.scrollbar.vertical",
                        "ui.basic.var":"vertical"
                    }
                ]
            },
            {
                "ui.style.display": "flex",
                "ui.style.flex": "none",
                "ui.basic.elements": [
                    {
                        "ui.element.component": "widget.scrollbar.horizontal",
                        "ui.basic.var":"horizontal"
                    },
                    {
                        "ui.theme.class": "widget.scrollbar.corner"
                    }
                ]
            }
        ]
    };
    me.content = function (object) {
        return object.var.content;
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.ui.element.create(value, object.var.content, object.context);
            }
        }
    };
};
