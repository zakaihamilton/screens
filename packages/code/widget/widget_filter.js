/*
 @author Zakai Hamilton
 @component WidgetFilter
 */

screens.widget.filter = function WidgetFilter(me) {
    me.element = {
        dependencies: {
            properties: ["line"]
        },
        redirect : {
            "ui.basic.text": "text"
        },
        properties: {
            "ui.basic.tag": "div",
            "ui.basic.html": "@html"
        },
        draw: function(object) {
            setTimeout(() => {
                me.updatePrefixes(object);
                me(object);
            }, 0);
        }
    };
    me.updatePrefixes = function(object) {
        var widget = me.ui.node.container(object, me.id);
        var prefixes = widget.querySelector("#prefixes");
        var prefixesSelect = widget.querySelector("#prefixes-select");
        var prefixesList = me.core.property.get(widget, widget.prefixes);
        if(prefixesList) {
            for(var prefixItem of prefixesList) {
                var option = document.createElement("option");
                option.textContent = prefixItem;
                prefixesSelect.appendChild(option);
            }
        }
        prefixes.style.display = prefixesList.length ? "" : "none";
    };
    me.proxy.apply = async function (object) {
        var widget = me.ui.node.container(object, me.id);
        var prefixesSelect = widget.querySelector("#prefixes-select");
        var filter = widget.querySelector("#filter");
        if (!widget) {
            return;
        }
        me.core.property.set(widget, widget.filter, {
            prefix:prefixesSelect.value,
            text:filter.value
        });
    };
    me.prefixes = function (object, value) {
        object.prefixes = value;
    };
    me.filter = function (object, value) {
        object.filter = value;
    };
    me.html = function () {
        return __html__;
    };
};
