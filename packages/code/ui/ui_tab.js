/*
 @author Zakai Hamilton
 @component UITab
 */

screens.ui.tab = function UITab(me) {
    me.control = function (object) {
        me.ui.node.iterate(object, (element) => {
            var tab = me.core.property.get(element, "ui.attribute.tab");
            if (!tab) {
                return;
            }
            me.core.property.set(element, "ui.touch.click", "ui.tab.activate");
        });
    };
    me.activate = function (object) {
        var window = me.widget.window(object);
        var tab = me.core.property.get(object, "ui.attribute.tab");
        var widget = null;
        if (tab) {
            widget = object;
        }
        else {
            me.ui.node.iterate(object, (element) => {
                var tab = me.core.property.get(element, "ui.attribute.tab");
                if (!tab) {
                    return;
                }
                var isActive = me.core.property.get(element, "ui.class.is-active");
                if(isActive) {
                    widget = element;
                    return;
                }
            });
            if(!widget) {
                return;
            }
            tab = me.core.property.get(widget, "ui.attribute.tab");
        }
        me.ui.node.iterate(widget.parentNode, (element) => {
            me.core.property.set(element, "ui.class.remove", "is-active");
        }, false);
        me.core.property.set(widget, "ui.class.add", "is-active");
        me.ui.node.iterate(window, (element) => {
            var owner = me.core.property.get(element, "ui.tab.owner");
            if (owner) {
                me.core.property.set(element, "ui.style.display", owner === tab ? "" : "none");
            }
        });
    };
    me.owner = {
        get: function (object) {
            return object.ui_tab_owner;
        },
        set: function (object, value) {
            object.ui_tab_owner = value;
            me.core.property.set(object, "ui.style.display", "none");
        }
    };
};