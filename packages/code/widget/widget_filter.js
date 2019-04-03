/*
 @author Zakai Hamilton
 @component WidgetFilter
 */

screens.widget.filter = function WidgetFilter(me, packages) {
    const { core } = packages;
    me.element = {
        dependencies: {
            properties: ["line"]
        },
        redirect: {
            "ui.basic.text": "text"
        },
        properties: {
            "ui.basic.tag": "div",
            "ui.class.add": ["field", "has-addons", "inherit-font"],
            "ui.style.margin": "6px",
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "div",
                    "ui.class.add": ["control", "is-expanded", "inherit-font"],
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "input",
                            "ui.class.add": ["input", "is-fullwidth", "inherit-font"],
                            "ui.basic.var": "filter",
                            "ui.attribute.type": "search",
                            "ui.attribute.placeholder": "Filter",
                            "ui.key.up": "execute",
                            "ui.monitor.search": "execute"
                        }
                    ]
                }
            ]
        }
    };
    me.execute = async function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (!widget) {
            return;
        }
        core.property.set(widget, widget.filter, {
            text: widget.var.filter.value
        });
    };
    me.filter = function (object, value) {
        object.filter = value;
    };
};
