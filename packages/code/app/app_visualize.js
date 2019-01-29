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
            me.core.property.set(window, "app", me);
        }
    };
    me.term = async function (object, text) {
        var html = await me.transform.term(object, text);
        object.termText = text;
        me.core.property.set(object, "ui.basic.html", html);
    };
    me.update = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.terms, "ui.style.fontSize", window.options.fontSize);
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
                var aText = a.firstElementChild.getAttribute("kab-" + order);
                var bText = b.firstElementChild.getAttribute("kab-" + order);
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
            if (order === "phase") {
                var previous = null;
                var result = [];
                elements.map(element => {
                    if (!element.firstElementChild.getAttribute) {
                        result.push(element);
                        return;
                    }
                    var text = element.firstElementChild.getAttribute("kab-" + order);
                    if (text !== previous) {
                        result.push(null);
                    }
                    previous = text;
                    result.push(element);
                });
                elements = result;
            }
        }
        var spacePixels = me.ui.basic.emToPixels(window.var.terms, 0.5);
        var left = spacePixels, top = spacePixels;
        var height = 0;
        for (var element of elements) {
            if (!element) {
                left = spacePixels;
                top += height + (spacePixels * 2);
                continue;
            }
            var region = me.ui.rect.relativeRegion(element, window.var.terms);
            height = region.height;
            if (left + region.width >= width - spacePixels) {
                left = spacePixels;
                top += region.height + spacePixels;
            }
            me.lib.interact.moveElement(element, left, top);
            left += region.width + spacePixels;
        }
    };
};
