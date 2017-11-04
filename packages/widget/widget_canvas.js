/*
 @author Zakai Hamilton
 @component WidgetCanvas
 */

package.widget.canvas = function WidgetCanvas(me) {
    me.default = {
        "ui.basic.tag": "canvas",
        "ui.class.class": "border"
    };
    me.create = {
        set: function (object) {
            me.canvas.node.attach(object);
            me.canvas.dirty.attach(object);
            object._appendChild = function (child) {
                return me.canvas.node.appendChild(this, child);
            };
            object._removeChild = function (child) {
                return me.canvas.node.removeChild(this, child);
            };
            object._insertBefore = function (child, sibling) {
                return me.canvas.node.insertBefore(this, child, sibling);
            };
            Object.defineProperty(object, "_firstChild", {
                get: function () {
                    return me.canvas.node.firstChild(object);
                }
            });
            Object.defineProperty(object, "_lastChild", {
                get: function () {
                    return me.canvas.node.lastChild(object);
                }
            });
        }
    };
    me.draw = {
        set: function (object) {
            var region = me.ui.rect.absolute_region(object.parentNode);
            if (parseInt(object.style.width) !== region.width || parseInt(object.style.height) !== region.height) {
                object.width = region.width;
                object.height = region.height;
                object.style.width = region.width + 'px';
                object.style.height = region.height + 'px';
                me.scale(object);
                me.canvas.dirty.draw(object, object);
            }
        }
    };
    me.scale = function (object) {
        var context = object.getContext('2d'),
        devicePixelRatio = window.devicePixelRatio || 1,
        backingStoreRatio = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1,
        ratio = devicePixelRatio / backingStoreRatio;
        if (devicePixelRatio !== backingStoreRatio) {
            var oldWidth = object.width;
            var oldHeight = object.height;
            object.width = oldWidth * ratio;
            object.height = oldHeight * ratio;
            object.style.width = oldWidth + 'px';
            object.style.height = oldHeight + 'px';
            context.scale(ratio, ratio);
        }
    };
    me.context = {
        get: function (object) {
            var context = object.getContext("2d");
            return context;
        }
    };
    me.createElement = function (tag) {
        var element = {
            tagName: tag,
            virtual: true
        };
        package["canvas"].components.map(function (component_name) {
            var component = package.path(component_name);
            if ("attach" in component) {
                component.attach(element);
            }
        });
        console.log("element: " + Object.keys(element));
        return element;
    };
};
