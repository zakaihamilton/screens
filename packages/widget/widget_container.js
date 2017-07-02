/*
 @author Zakai Hamilton
 @component WidgetContent
 */

package.widget.container = function WidgetContainer(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.style.display": "flex",
        "ui.style.flex": "1",
        "ui.style.flex-direction": "column"
    };
    me.create = {
        set: function (object) {
            me.ui.element.create([{
                    "ui.style.display": "flex",
                    "ui.style.flex": "1",
                    "ui.basic.elements": [
                        {
                            "ui.theme.class": "widget.container.border",
                            "ui.basic.var": "content"
                        },
                        {
                            "ui.element.component": "widget.scrollbar.vertical"
                        }
                    ]
                },
                {
                    "ui.style.display": "flex",
                    "ui.style.flex": "none",
                    "ui.basic.elements": [
                        {
                            "ui.element.component": "widget.scrollbar.horizontal"
                        },
                        {
                            "ui.theme.class": "widget.scrollbar.corner"
                        }
                    ]
                }
            ], object);
        }
    };
    me.content = function (object) {
        return object.var.content;
    };
    me.find = function (object) {
        while (object) {
            if (object === document.body) {
                return null;
            }
            if (object.component === me.id) {
                return object;
            }
            object = object.parentNode;
        }
        return null;
    };
};
