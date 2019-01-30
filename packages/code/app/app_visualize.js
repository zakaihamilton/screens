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
        html += me.ui.html.item({
            tag: "i",
            classes: ["fas", "fa-minus-circle", "app-visualize-delete"],
            attributes: {
                onclick: "screens.app.visualize.remove(this)"
            }
        });
        me.core.property.set(object, "ui.basic.html", html);
    };
    me.remove = function (object) {
        me.ui.node.removeChild(object.parentNode.parentNode, object.parentNode);
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
    me.sortDown = function (object, order) {
        me.sort(object, order, "down");
    };
    me.sortUp = function (object, order) {
        me.sort(object, order, "up");
    };
    me.sort = function (object, order, direction) {
        var window = me.widget.window.get(object);
        var { width } = me.ui.rect.absoluteRegion(window.var.terms);
        var elements = me.ui.node.childList(window.var.terms);
        if (typeof order === "string") {
            var orderList = order.split("/");
            for (let orderItem of orderList) {
                elements = elements.filter(Boolean);
                elements.sort((a, b) => {
                    var aChild = a.firstElementChild;
                    var bChild = b.firstElementChild;
                    if (!aChild || !bChild) {
                        return 0;
                    }
                    var aAttribute = aChild.getAttribute("kab-" + orderItem);
                    var bAttribute = bChild.getAttribute("kab-" + orderItem);
                    if (!aAttribute || !bAttribute) {
                        return 0;
                    }
                    var aText = aAttribute.split("/")[0];
                    var bText = bAttribute.split("/")[0];
                    if (orderItem === "phase") {
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
                if (direction === "up") {
                    elements.reverse();
                }
                if (orderItem === "phase" || orderItem === "category") {
                    var previous = null;
                    var result = [];
                    elements.map(element => {
                        if (!element.firstElementChild.getAttribute) {
                            result.push(element);
                            return;
                        }
                        var text = element.firstElementChild.getAttribute("kab-" + orderItem);
                        if (text !== previous) {
                            result.push(null);
                        }
                        previous = text;
                        result.push(element);
                    });
                    elements = result;
                }
            }
        }
        else if (direction === "up") {
            elements.reverse();
        }
        var spacePixels = me.ui.basic.emToPixels(window.var.terms, 0.5);
        var left = spacePixels, top = spacePixels;
        var height = 0;
        for (var element of elements) {
            if (!element) {
                left = spacePixels;
                top += height + (spacePixels * 3);
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
    me.keyPress = async function (object, event) {
        var window = me.widget.window.get(object);
        var text = String.fromCharCode(event.charCode);
        if (!window.termInput) {
            window.termInput = "";
        }
        if (event.keyCode === 13) {
            if (window.termInput) {
                var element = me.ui.element.create({
                    "ui.basic.tag": "div",
                    "ui.class.class": "app.visualize.term",
                }, window.var.terms);
                await me.core.property.set(element, "app.visualize.term", window.termInput);
                var left = window.termPos.left, top = window.termPos.top;
                var region = me.ui.rect.absoluteRegion(element);
                left -= region.width / 2;
                top -= region.height / 2;
                me.lib.interact.moveElement(element, left, top);
                window.termInput = "";
            }
        }
        else {
            window.termInput += text;
        }
        me.widget.toast.show("visualize", window.termInput.trim());
    };
    me.keyUp = async function (object, event) {
        var window = me.widget.window.get(object);
        if (!window.termInput) {
            window.termInput = "";
        }
        if (event.keyCode === 8) {
            window.termInput = window.termInput.slice(0, -1);
            me.widget.toast.show("visualize", window.termInput.trim());
        }
    };
    me.touchMove = function (object, event) {
        var window = me.widget.window.get(object);
        var target_region = me.ui.rect.absoluteRegion(window.var.terms);
        window.termPos = {
            left: event.clientX - target_region.left,
            top: event.clientY - target_region.top
        };
    };
};
