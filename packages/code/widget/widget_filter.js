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
                    "ui.class.add": ["control", "select", "inherit-font"],
                    "ui.basic.var": "prefixes",
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "select",
                            "ui.class.class": null,
                            "ui.class.add": ["inherit-font"],
                            "ui.property.style": {
                                "borderBottomRightRadius": "0px",
                                "borderTopRightRadius": "0px"
                            },
                            "ui.basic.var": "select",
                            "ui.monitor.change": "execute"
                        }
                    ]
                },
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
    me.update = function (object) {
        me.updatePrefixes(object);
        me.execute(object);
    };
    me.updatePrefixes = function (object) {
        var widget = me.ui.node.container(object, me.id);
        var prefixesList = core.property.get(widget, widget.prefixes);
        if (prefixesList) {
            for (var prefixItem of prefixesList) {
                var option = document.createElement("option");
                option.textContent = prefixItem;
                widget.var.select.appendChild(option);
            }
        }
        widget.var.prefixes.style.display = prefixesList.length ? "" : "none";
    };
    me.execute = async function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (!widget) {
            return;
        }
        core.property.set(widget, widget.filter, {
            prefix: widget.var.select.value,
            text: widget.var.filter.value
        });
    };
    me.prefixes = function (object, value) {
        object.prefixes = value;
    };
    me.filter = function (object, value) {
        object.filter = value;
    };
};
