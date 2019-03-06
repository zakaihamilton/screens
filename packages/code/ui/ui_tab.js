/*
 @author Zakai Hamilton
 @component UITab
 */

screens.ui.tab = function UITab(me, packages) {
    const { core } = packages;
    me.control = function (object) {
        me.ui.node.iterate(object, (element) => {
            var tab = core.property.get(element, "ui.attribute.tab");
            if (!tab) {
                return;
            }
            core.property.set(element, "ui.touch.click", "ui.tab.activate");
        });
    };
    me.activate = function (object) {
        var window = me.widget.window.get(object);
        var tab = core.property.get(object, "ui.attribute.tab");
        var widget = null;
        if (tab) {
            widget = object;
        }
        else {
            me.ui.node.iterate(object, (element) => {
                var tab = core.property.get(element, "ui.attribute.tab");
                if (!tab) {
                    return;
                }
                var isActive = core.property.get(element, "ui.class.is-active");
                if (isActive) {
                    widget = element;
                    return;
                }
            });
            if (!widget) {
                return;
            }
            tab = core.property.get(widget, "ui.attribute.tab");
        }
        me.ui.node.iterate(widget.parentNode, (element) => {
            core.property.set(element, "ui.class.remove", "is-active");
        }, false);
        core.property.set(widget, "ui.class.add", "is-active");
        me.ui.node.iterate(window, (element) => {
            var owner = core.property.get(element, "ui.tab.owner");
            if (owner) {
                core.property.set(element, "ui.class.ui-tab-hidden", owner !== tab);
            }
        });
    };
    me.owner = {
        get: function (object) {
            return object.ui_tab_owner;
        },
        set: function (object, value) {
            object.ui_tab_owner = value;
            core.property.set(object, "ui.class.ui-tab-hidden", true);
        }
    };
};