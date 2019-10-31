/*
 @author Zakai Hamilton
 @component AppVisualize
 */

screens.app.visualize = function AppVisualize(me, { core, ui, widget }) {
    me.init = async function () {
        await ui.transform.implement(me);
        await ui.content.implement(me);
    };
    me.launch = async function (args) {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.close");
        }
        if (!args) {
            args = [""];
        }
        var json = me.json;
        var params = args[0];
        if (params && params.fullscreen) {
            json["widget.window.fullscreen"] = null;
        }
        await me.content.update();
        var window = me.singleton = ui.element.create(json, "workspace", "self", params);
        if (window.var.terms) {
            window.var.terms.focus();
        }
        if (typeof args[0] === "string") {
            me.content.import(window, args[0], args[1]);
        }
        else {
            core.property.set(window, "ui.property.after", {
                "app.visualize.sortDown": null,
                "timeout": 1000
            });
        }
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = widget.window.get(object);
            var options = me.transform.options();
            ui.options.load(me, window, Object.assign({}, options.load));
            ui.options.toggleSet(me, null, Object.assign({}, options.toggle));
            ui.options.choiceSet(me, null, Object.assign({
                "fontSize": (object, value) => {
                    core.property.set(window.var.terms, "ui.style.fontSize", value);
                    core.property.notify(window, "update");
                }
            }, options.choice));
            core.property.set(window, "app", me);
        }
    };
    me.importData = function (object, text, title, options) {
        var window = widget.window.get(object);
        me.clear(window);
        core.property.set(window, "widget.window.name", title);
        var data = JSON.parse(text);
        for (var item of data) {
            var emLeft = parseInt(item.left);
            var emTop = parseInt(item.top);
            var pixelLeft = parseInt(ui.basic.emToPixels(window.var.terms, item.left));
            var pixelTop = parseInt(ui.basic.emToPixels(window.var.terms, item.top));
            me.createTerm(object, {
                "ui.attribute.pixelLeft": pixelLeft,
                "ui.attribute.pixelTop": pixelTop,
                "ui.attribute.emLeft": emLeft,
                "ui.attribute.emTop": emTop,
                "ui.style.left": emLeft + "em",
                "ui.style.top": emTop + "em",
                "ui.attribute.text": item.text
            });
        }
        me.reload(window);
    };
    me.exportData = function (object) {
        var window = widget.window.get(object);
        var elements = ui.node.childList(window.var.terms);
        var data = [];
        for (var element of elements) {
            var text = core.property.get(element, "ui.attribute.text");
            var left = core.property.get(element, "ui.attribute.emLeft");
            var top = core.property.get(element, "ui.attribute.emTop");
            data.push({ left, top, text });
        }
        if (!data.length) {
            return [];
        }
        return [JSON.stringify(data), {}];
    };
    me.term = async function (object, text) {
        var html = await me.transform.term(object, text);
        core.property.set(object, "ui.attribute.text", text);
        html += ui.html.item({
            tag: "i",
            classes: ["fas", "fa-minus-circle", "app-visualize-delete"],
            attributes: {
                onclick: "screens.app.visualize.remove(this)"
            }
        });
        core.property.set(object, "ui.basic.html", html);
    };
    me.remove = function (object) {
        ui.node.removeChild(object.parentNode.parentNode, object.parentNode);
    };
    me.update = function (object) {
        var window = widget.window.get(object);
        core.property.set(window.var.terms, "ui.style.fontSize", window.options.fontSize);
    };
    me.reload = function (object) {
        var window = widget.window.get(object);
        var elements = ui.node.childList(window.var.terms);
        for (var element of elements) {
            var text = core.property.get(element, "ui.attribute.text");
            core.property.set(element, "app.visualize.term", text);
        }
    };
    me.clear = function (object) {
        var window = widget.window.get(object);
        core.property.set(window, "widget.window.name", "");
        ui.node.empty(window.var.terms);
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
        var window = widget.window.get(object);
        var { width } = ui.rect.absoluteRegion(window.var.terms);
        var elements = ui.node.childList(window.var.terms);
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
                        let aIndex = widget.transform.phases[aText];
                        let bIndex = widget.transform.phases[bText];
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
        var spacePixels = parseInt(ui.basic.emToPixels(window.var.terms, 1));
        var left = spacePixels, top = spacePixels;
        var height = 0;
        elements.map(element => core.property.set(element, "ui.style.transition", ""));
        for (var element of elements) {
            if (!element) {
                left = spacePixels;
                top += height + (spacePixels * 2);
                continue;
            }
            var region = ui.rect.relativeRegion(element, window.var.terms);
            height = parseInt((region.height / spacePixels) + 1) * spacePixels;
            if (left + region.width >= width - spacePixels) {
                left = spacePixels;
                top += height + spacePixels;
            }
            me.moveElement(element, left, top);
            left += parseInt(region.width) + spacePixels;
            left = parseInt((left / spacePixels) + 1) * spacePixels;
        }
    };
    me.applyCurrentElement = function (object) {
        var window = widget.window.get(object);
        if (window.currentElement) {
            core.property.set(window.currentElement, "ui.class.mobile", false);
            window.currentElement = null;
            window.termInput = "";
        }
    };
    me.createTerm = function (object, properties) {
        var window = widget.window.get(object);
        var element = ui.element.create(Object.assign({
            "ui.basic.tag": "div",
            "ui.class.class": "app.visualize.term",
            "ui.style.transition": "none",
            "ui.move.extend": "this",
            "ui.move.enabled": true,
            "ui.move.method": "app.visualize.moveTerm",
            "ui.move.relative": true
        }, properties), window.var.terms);
        return element;
    };
    me.updateCurrentElement = async function (object, update) {
        var window = widget.window.get(object);
        var text = window.termInput;
        if (text) {
            text = text.trim();
        }
        if (!text) {
            if (window.currentElement) {
                core.property.set(window.currentElement, "ui.node.parent");
                window.currentElement = null;
            }
            return;
        }
        var element = window.currentElement;
        if (!element) {
            element = window.currentElement = me.createTerm(object, {
                "ui.class.mobile": true,
                "ui.touch.click": me.applyCurrentElement,
            });
        }
        if (update) {
            await core.property.set(element, "app.visualize.term", window.termInput);
        }
        var left = window.termPos.left, top = window.termPos.top;
        var region = ui.rect.absoluteRegion(element);
        left -= region.width / 2;
        top -= region.height / 2;
        me.moveElement(element, left, top);
    };
    me.keyPress = function (object, event) {
        var window = widget.window.get(object);
        var text = String.fromCharCode(event.charCode);
        event.stopPropagation();
        if (!window.termInput) {
            window.termInput = "";
        }
        if (event.charCode === 13) {
            text = " ";
        }
        if (!window.termInput && text === " ") {
            return;
        }
        window.termInput += text;
        if (window.updateTimer) {
            clearTimeout(window.updateTimer);
        }
        window.updateTimer = setTimeout(() => {
            me.updateCurrentElement(object, true);
        }, 250);
    };
    me.keyUp = function (object, event) {
        var window = widget.window.get(object);
        event.stopPropagation();
        if (!window.termInput) {
            window.termInput = "";
        }
        if (event.keyCode === 8) {
            window.termInput = window.termInput.slice(0, -1);
            me.updateCurrentElement(object, true);
        }
    };
    me.touchMove = function (object, event) {
        var window = widget.window.get(object);
        var target_region = ui.rect.relativeRegion(object);
        var left = event.clientX - target_region.left + widget.scrollLeft;
        var top = event.clientY - target_region.top + widget.scrollTop;
        window.termPos = {
            left,
            top
        };
        me.updateCurrentElement(object);
    };
    me.moveTerm = function (object, event) {
        var { left, top, target } = ui.move.info;
        var x = event.clientX - left;
        var y = event.clientY - top;
        var emSpace = parseInt(ui.basic.pixelsToEm(target.parentNode, 1));
        me.moveElement(target, x, y - (emSpace * 2));
    };
    me.moveElement = function (object, x, y) {
        var emX = parseInt(ui.basic.pixelsToEm(object.parentNode, x));
        var emY = parseInt(ui.basic.pixelsToEm(object.parentNode, y));
        core.property.set(object, "ui.attribute.pixelLeft", x);
        core.property.set(object, "ui.attribute.pixelTop", y);
        core.property.set(object, "ui.attribute.emLeft", emX);
        core.property.set(object, "ui.attribute.emTop", emY);
        core.property.set(object, "ui.style.left", emX + "em");
        core.property.set(object, "ui.style.top", emY + "em");
        core.property.set(object, "ui.style.opacity", "");
    };
};
