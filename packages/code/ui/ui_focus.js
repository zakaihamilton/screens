/*
 @author Zakai Hamilton
 @component UIFocus
 */

screens.ui.focus = function UIFocus(me) {
    me.focus_window = null;
    me.extend = {
        set: function (object) {
            object.addEventListener('mousedown', function (e) {
                var branch = me.find_branch(object, e.clientX, e.clientY);
                if (branch) {
                    me.core.property.set(branch, "ui.focus.active", true);
                }
            }, false);
        }
    };
    me.is_active = function (object) {
        var parent = me.focus_window;
        while (parent) {
            if (parent === object) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    };
    me.find_branch = function (object, x, y) {
        /* Find the lowest matching element on position */
        var childList = me.ui.node.childList(object);
        for (var index = childList.length - 1; index >= 0; index--) {
            var node = childList[index];
            if (!node.component) {
                continue;
            }
            var rect = me.ui.rect.absoluteRegion(node);
            var in_rect = me.ui.rect.inRegion(rect, x, y);
            if (in_rect) {
                var branch = me.find_branch(node, x, y);
                if (branch) {
                    return branch;
                }
                return node;
            }
        }
        return null;
    };
    me.deactivate = function (from, to) {
        while (from && from !== to) {
            me.core.property.set(from, "ui.property.broadcast", {
                "ui.class.remove": "focus"
            });
            me.core.property.set(from, "ui.property.broadcast", {
                "blur": from
            });
            from = me.widget.window.parent(from);
        }
    };
    me.activate = function (from, to) {
        while (from && from !== to) {
            me.core.property.set(from, "ui.property.broadcast", {
                "ui.class.add": "focus"
            });
            me.core.property.set(from, "ui.property.broadcast", {
                "focus": from
            });
            me.updateOrder(from.parentNode, from);
            var parent = me.widget.window.parent(from);
            if (parent && me.core.property.get(parent, "embed")) {
                parent = me.widget.window.parent(parent);
            }
            if (parent) {
                parent.focus_window = from;
            }
            from = parent;
        }
    };
    me.updateOrder = function (parent, object = null, order = - 1) {
        var childList = me.ui.node.childList(parent);
        if (object) {
            if (order === -1) {
                order = childList.length - 1;
            }
            var prevOrder = childList.indexOf(object);
            childList.splice(prevOrder, 1);
            childList.splice(order, 0, object);
        }
        for (var childOrder = 0; childOrder < childList.length; childOrder++) {
            if (childList[childOrder].component !== "widget.window") {
                continue;
            }
            if (me.core.property.get(childList[childOrder], "alwaysOnTop")) {
                continue;
            }
            me.core.property.set(childList[childOrder], "ui.style.zIndex", childOrder);
        }
        for (var childOrder = childList.length - 1; childOrder >= 0; childOrder--) {
            if (!me.core.property.get(childList[childOrder], "alwaysOnTop")) {
                continue;
            }
            me.core.property.set(childList[childOrder], "ui.style.zIndex", 999 - childOrder);
        }
        if (object) {
            me.core.property.notify(object, "update");
        }
    };
    me.common = function (source, target) {
        if (!source || !target) {
            return me.ui.element.root;
        }
        var common = null, focusable = null;
        var sources = me.ui.node.path(source);
        var targets = me.ui.node.path(target);
        var length = sources.length > targets.length ? targets.length : sources.length;
        for (var index = 0; index < length; index++) {
            if (sources[index] === targets[index]) {
                common = sources[index];
                if (common.component === "widget.window" && !me.core.property.get(common, "embed")) {
                    focusable = common;
                    break;
                }
            } else {
                break;
            }
        }
        return focusable;
    };
    me.active = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return me.is_active(window);
        },
        set: function (object, value) {
            var window = me.widget.window.get(object);
            var is_active = me.is_active(window);
            if (!is_active && value) {
                me.focus(window);
            } else if (is_active && !value) {
                var parent = me.widget.window.parent(object);
                if (parent) {
                    me.focus(parent);
                }
                else {
                    me.deactivate(object, null);
                    me.focus_window = null;
                }
            }
        }
    };
    me.findLeaf = function (window) {
        var leaf = window;
        while (window) {
            window = window.focus_window;
            if (window) {
                leaf = window;
            }
        }
        return leaf;
    };
    me.focus = function (window) {
        /* Check if window is visible */
        if (!me.core.property.get(window, "visible")) {
            return;
        }
        if (me.core.property.get(window, "embed")) {
            window = me.widget.window.parent(window);
        }
        /* Find bottom window to focus on */
        window = me.findLeaf(window);
        /* Find common window between previous and new window */
        var common = me.common(me.focus_window, window);
        /* Deactivate previous windows */
        me.deactivate(me.focus_window, common);
        /* Activate new window */
        me.focus_window = window;
        me.activate(window, common);
    };
};
