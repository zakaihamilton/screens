/*
 @author Zakai Hamilton
 @component UIFocus
 */

package.ui.focus = function UIFocus(me) {
    me.focus_window = null;
    me.extend = function(object) {
        me.set(object, "ui.focus.active", true);
        object.addEventListener('mousedown', function (e) {
            var branch = me.find_branch(object, e.clientX, e.clientY);
            if(branch) {
                me.set(branch, "ui.focus.active", true);
            }
        }, false);
    };
    me.is_active = function(object) {
        var parent = me.focus_window;
        while(parent) {
            if(parent === object) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    };
    me.find_branch = function(object, x, y) {
        /* Find the lowest matching element on position */
        var childList = me.ui.node.childList(object);
        for(var index = childList.length-1; index >= 0; index--) {
            var node = childList[index];
            if(!node.component) {
                continue;
            }
            var rect = me.ui.rect.absolute_region(node);
            var in_rect = me.ui.rect.in_region(rect, x, y);
            if(in_rect) {
                var branch = me.find_branch(node, x, y);
                if(branch) {
                    return branch;
                }
                return node;
            }
        }
        return null;
    };
    me.deactivate = function(from, to) {
        while(from && from !== to) {
            me.set(from, "ui.property.broadcast", {"ui.theme.remove": "focus"});
            me.set(from, "ui.property.broadcast", {"blur": from});
            from = me.widget.window.parent(from);
        }
    };
    me.activate = function(from, to) {
        while(from && from !== to) {
            me.set(from, "ui.property.broadcast", {"ui.theme.add": "focus"});
            me.set(from, "ui.property.broadcast", {"focus": from});
            me.updateOrder(from.parentNode, from);
            from = me.widget.window.parent(from);
        }
    };
    me.updateOrder = function(parent, object=null, order=parent.childNodes.length-1) {
        var childList = me.ui.node.childList(parent);
        if(object) {
            var prevOrder = childList.indexOf(object);
            childList.splice(prevOrder, 1);
            childList.splice(order, 0, object);
        }
        for(var childOrder = 0; childOrder < childList.length; childOrder++) {
            me.set(childList[childOrder], "ui.style.zIndex", childOrder);
        }
    };
    me.common = function(source, target) {
        if(!source || !target) {
            return me.ui.element.root;
        }
        var common = null, focusable = null;
        var sources = me.ui.node.path(source);
        var targets = me.ui.node.path(target);
        var length = sources.length > targets.length ? targets.length : sources.length;
        for(var index = 0; index < length; index++) {
            if(sources[index] === targets[index]) {
                common = sources[index];
                if(common.focusable) {
                    focusable = common;
                    break;
                }
            }
            else {
                break;
            }
        }
        return focusable;
    };
    me.active = {
        get: function(object) {
            var window = me.widget.window.window(object);
            return me.is_active(window);
        },
        set: function(object, value) {
            var window = me.widget.window.window(object);
            var is_active = me.is_active(window);
            if(!is_active && value) {
                me.focus(window);
            }
            else if(is_active && !value) {
                var parent = me.widget.window.parent(object);
                me.focus(parent);
            }
        }
    };
    me.focus = function(window) {
        /* Find common window between previous and new window */
        var common = me.common(me.focus_window, window);
        /* Deactivate previous windows */
        me.deactivate(me.focus_window, common);
        /* Activate new window */
        me.activate(window, common);
        me.focus_window = window;
    };
};
