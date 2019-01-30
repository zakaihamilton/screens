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
        if (window.var.terms) {
            window.var.terms.focus();
        }
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
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.ui.node.empty(window.var.terms);
    };
    me.sortDown = function (object, order) {
        me.sort(object, order, "down");
        me.sort(object, order, "down");
    };
    me.sortUp = function (object, order) {
        me.sort(object, order, "up");
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
                if (orderItem === "phase" || orderItem === "category") {
                    var previous = null;
                    var result = [];
                    elements.map(element => {
                        if (!element.firstElementChild.getAttribute) {
                            result.push(element);
                            return;
                        }
                        var text = element.firstElementChild.getAttribute("kab-" + orderItem);
                        if (previous !== null && text !== previous) {
                            result.push(null);
                        }
                        previous = text;
                        result.push(element);
                    });
                    elements = result;
                }
            }
        }
        if (direction === "up") {
            elements.reverse();
        }
        var spacePixels = parseInt(me.ui.basic.emToPixels(window.var.terms, 1));
        var left = spacePixels, top = spacePixels;
        var height = 0;
        elements.map(element => me.core.property.set(element, "ui.style.transition", ""));
        for (var element of elements) {
            if (!element) {
                left = spacePixels;
                top += height + (spacePixels * 2);
                continue;
            }
            var region = me.ui.rect.relativeRegion(element, window.var.terms);
            height = parseInt(region.height);
            if (left + region.width >= width - spacePixels) {
                left = spacePixels;
                top += height + spacePixels;
            }
            me.moveElement(element, left, top);
            left += parseInt(region.width) + spacePixels;
            left = parseInt(left / spacePixels) * spacePixels;
        }
    };
    me.applyCurrentElement = function (object) {
        var window = me.widget.window.get(object);
        if (window.currentElement) {
            me.core.property.set(window.currentElement, "ui.class.mobile", false);
            window.currentElement = null;
            window.termInput = "";
        }
    };
    me.createElement = function (object, properties) {
        var window = me.widget.window.get(object);
        var element = me.ui.element.create(Object.assign({
            "ui.basic.tag": "div",
            "ui.class.class": "app.visualize.term",
            "ui.style.transition": "none",
            "ui.move.extend": "this",
            "ui.move.enabled": true,
            "ui.move.method": "app.visualize.moveTerm"
        }, properties), window.var.terms);
        return element;
    };
    me.updateCurrentElement = async function (object, update) {
        var window = me.widget.window.get(object);
        if (!window.termInput) {
            if (window.currentElement) {
                me.core.property.set(window.currentElement, "ui.node.parent");
                window.currentElement = null;
            }
            return;
        }
        var element = window.currentElement;
        if (!element) {
            element = window.currentElement = me.createElement(object, {
                "ui.class.mobile": true,
                "ui.touch.click": me.applyCurrentElement,
            });
        }
        if (update) {
            await me.core.property.set(element, "app.visualize.term", window.termInput);
        }
        var left = window.termPos.left, top = window.termPos.top;
        var region = me.ui.rect.absoluteRegion(element);
        left -= region.width / 2;
        top -= region.height / 2;
        me.moveElement(element, left, top);
    };
    me.keyPress = async function (object, event) {
        var window = me.widget.window.get(object);
        var text = String.fromCharCode(event.charCode);
        if (!window.termInput) {
            window.termInput = "";
        }
        if (event.charCode === 13) {
            text = " ";
        }
        window.termInput += text;
        if (window.updateTimer) {
            clearTimeout(window.updateTimer);
        }
        window.updateTimer = setTimeout(() => {
            me.updateCurrentElement(object, true);
        }, 250);
    };
    me.keyUp = async function (object, event) {
        var window = me.widget.window.get(object);
        if (!window.termInput) {
            window.termInput = "";
        }
        if (event.keyCode === 8) {
            window.termInput = window.termInput.slice(0, -1);
            me.updateCurrentElement(object, true);
        }
    };
    me.touchMove = function (object, event) {
        var window = me.widget.window.get(object);
        var target_region = me.ui.rect.absoluteRegion(window.var.terms);
        window.termPos = {
            left: event.clientX - target_region.left,
            top: event.clientY - target_region.top
        };
        me.updateCurrentElement(object);
    };
    me.moveTerm = function (object, event) {
        var x = (parseFloat(object.getAttribute("data-x")) || 0) + event.movementX;
        var y = (parseFloat(object.getAttribute("data-y")) || 0) + event.movementY;
        me.moveElement(object, x, y);
    };
    me.moveElement = function (object, x, y) {
        var emX = me.ui.basic.pixelsToEm(object.parentNode, x);
        var emY = me.ui.basic.pixelsToEm(object.parentNode, y);
        object.style.transform = "translate(" + Math.ceil(emX) + "em, " + Math.ceil(emY) + "em)";
        object.setAttribute("data-x", x);
        object.setAttribute("data-y", y);
    };
};
