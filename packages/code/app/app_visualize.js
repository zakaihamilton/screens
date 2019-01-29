/*
 @author Zakai Hamilton
 @component AppVisualize
 */

screens.app.visualize = function AppVisualize(me) {
    me.init = async function () {
        await me.ui.transform.attach(me);
    };
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.close");
        }
        if (!args) {
            args = [""];
        }
        var json = __json__;
        var params = args[0];
        if (params && params.fullscreen) {
            json["widget.window.fullscreen"] = null;
        }
        var window = me.singleton = me.ui.element.create(json, "workspace", "self", params);
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            var options = me.transform.options();
            if (!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.ui.options.load(me, window, Object.assign({
                }, options.load));
            }
            me.ui.options.toggleSet(me, null, Object.assign({}, options.toggle));
            me.ui.options.choiceSet(me, null, Object.assign({
                "fontSize": (object, value) => {
                    me.core.property.set(window.var.terms, "ui.style.fontSize", value);
                    me.core.property.notify(window, "update");
                }
            }, options.choice));
            me.ui.class.useStylesheet("kab");
            me.core.property.set(window.var.terms, "ui.style.fontSize", window.options.fontSize);
            me.core.property.set(window, "app", me);
        }
    };
    me.term = async function (object, text) {
        var html = await me.transform.term(object, text);
        object.termText = text;
        me.core.property.set(object, "ui.basic.html", html);
    };
    me.reload = function (object) {
        var window = me.widget.window.get(object);
        var elements = me.ui.node.childList(window.var.terms);
        for (var element of elements) {
            me.core.property.set(element, "app.visualize.term", element.termText);
        }
    };
    me.sort = function (object, order) {
        var window = me.widget.window.get(object);
        var { width } = me.ui.rect.absoluteRegion(window.var.terms);
        var elements = me.ui.node.childList(window.var.terms);
        if (typeof order === "string") {
            elements.sort((a, b) => {
                var aText = a.firstChild.getAttribute("kab-" + order);
                var bText = b.firstChild.getAttribute("kab-" + order);
                if (order === "phase") {
                    let aIndex = me.widget.transform.phases[aText];
                    let bIndex = me.widget.transform.phases[bText];
                    if (typeof aIndex === "undefined") {
                        aIndex = -1;
                    }
                    if (typeof bIndex === "undefined") {
                        bIndex = -1;
                    }
                    return aIndex - bIndex;
                }
                else {
                    return aText.localeCompare(bText);
                }
            });
        }
        var left = 10, top = 10;
        for (var element of elements) {
            var region = me.ui.rect.relativeRegion(element, window.var.terms);
            if (left + region.width >= width) {
                left = 10;
                top += region.height + 10;
            }
            me.lib.interact.moveElement(element, left, top);
            left += region.width + 10;
        }
    };
};
