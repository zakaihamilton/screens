/*
 @author Zakai Hamilton
 @component UIFocus
 */

package.ui.focus = function UIFocus(me) {
    me.focus_window = null;
    me.extend = function(object) {
        me.set(object, "ui.focus.active", true);
        object.addEventListener('click', function (e) {
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
        for(var index = 0; index < object.childNodes.length; index++) {
            var node = object.childNodes[index];
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
            me.ui.property.broadcast(from, "ui.theme.remove", "focus")
            from = me.widget.window.parent(from);
        }
    };
    me.activate = function(from, to) {
        while(from && from !== to) {
            me.ui.property.broadcast(from, "ui.theme.add", "focus");
            me.updateOrder(from.parentNode, from);
            from = me.widget.window.parent(from);
        }
    };
    me.childList = function(object) {
        var childList = Array(object.childNodes.length).fill(null);
        for(var childIndex = 0; childIndex < object.childNodes.length; childIndex++) {
            var child = object.childNodes[childIndex];
            var order = 0;
            if(child.component) {
                order = me.get(child, "ui.style.zIndex");
            }
            if(!order) {
                order = childIndex;
            }
            childList[order] = child;
        }
        return childList;
    };
    me.updateOrder = function(parent, object=null, order=parent.childNodes.length-1) {
        var length = parent.childNodes.length;
        var childList = me.childList(parent);
        if(object) {
            var prevOrder = me.get(object, "ui.style.zIndex");
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
            if(!me.is_active(window)) {
                /* Find common window between previous and new window */
                var common = me.common(me.focus_window, window);
                /* Deactivate previous windows */
                me.deactivate(me.focus_window, common);
                /* Activate new window */
                me.activate(window, common);
                me.focus_window = window;
            }
        }
    };
};
