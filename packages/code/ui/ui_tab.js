/*
 @author Zakai Hamilton
 @component UITab
 */

screens.ui.tab = function UITab(me, { core, ui, widget }) {
    me.control = function (object) {
        ui.node.iterate(object, (element) => {
            var tab = core.property.get(element, "ui.attribute.tab");
            if (!tab) {
                return;
            }
            core.property.set(element, "ui.touch.click", "ui.tab.activate");
        });
    };
    me.activate = function (object) {
        var window = widget.window.get(object);
        var tab = core.property.get(object, "ui.attribute.tab");
        var result = null;
        if (tab) {
            result = object;
        }
        else {
            ui.node.iterate(object, (element) => {
                var tab = core.property.get(element, "ui.attribute.tab");
                if (!tab) {
                    return;
                }
                var isActive = core.property.get(element, "ui.class.is-active");
                if (isActive) {
                    result = element;
                    return;
                }
            });
            if (!result) {
                return;
            }
            tab = core.property.get(result, "ui.attribute.tab");
        }
        ui.node.iterate(result.parentNode, (element) => {
            core.property.set(element, "ui.class.remove", "is-active");
        }, false);
        core.property.set(result, "ui.class.add", "is-active");
        ui.node.iterate(window, (element) => {
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