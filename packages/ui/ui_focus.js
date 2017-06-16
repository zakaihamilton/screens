/*
 @author Zakai Hamilton
 @component UIFocus
 */

package.ui.focus = function UIFocus(me) {
    me.focus_element = null;
    me.extend = function(object) {
        me.ui.element.set(object, "ui.focus.focusable", true);
        me.ui.element.set(object, "ui.focus.active", true);
        object.addEventListener('mousedown', function (e) {
            var branch = me.find_branch(object, e.clientX, e.clientY);
            if(branch) {
                me.ui.element.set(branch, "ui.focus.active", true);
            }
        }, true);
    };
    me.find_branch = function(object, x, y) {
        /* Find the lowest matching element on position */
        for(var index = 0; index < object.childNodes.length; index++) {
            var node = object.childNodes[index];
            var rect = me.ui.rect.absolute_region(node);
            var in_rect = me.ui.rect.in_region(rect, x, y);
            if(in_rect) {
                var branch = me.find_branch(node, x, y);
                if(branch) {
                    return branch;
                }
            }
        }
        if(object.focusable) {
            return object;
        }
        else {
            return null;
        }
    };
    me.deactivate = function(from, to) {
        while(from && from !== to) {
            from.is_active = false;
            me.apply_focus(from, false);
            from = from.parentNode;
        }
    };
    me.activate = function(list, from, to) {
        var index = 0;
        if(from === to) {
            return;
        }
        if(from) {
            for (; index < list.length; index++) {
                if (list[index] === from) {
                    break;
                }
            }
        }
        for(;index < list.length;index++) {
            var object = list[index];
            object.is_active = true;
            me.apply_focus(object, true);
            if(object === to) {
                break;
            }
        }
    };
    me.common = function(source, target) {
        if(!source || !target) {
            return me.ui.element.root;
        }
        var common = null, focusable = null;
        var sources = me.ui.element.to_objects(source);
        var targets = me.ui.element.to_objects(target);
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
    me.apply_focus = function(object, state) {
        if(state) {
            if(object.focus_class) {
                me.ui.element.set(object, "ui.style.class", object.focus_class);
            }
        }
        else {
            if(object.blur_class) {
                me.ui.element.set(object, "ui.style.class", object.blur_class);
            }
        }
        for(var index = 0; index < object.childNodes.length; index++) {
            var child = object.childNodes[index];
            if(child.focusable) {
                continue;
            }
            me.apply_focus(child, state);
        }
    };
    me.focusable = {
        get: function(object) {
            return object.focusable;
        },
        set: function(object, value) {
            object.focusable = value;
        }
    };
    me.active = {
        get: function(object) {
            return object.is_active;
        },
        set: function(object, value) {
            var focus_element = me.ui.element.to_object(me.focus_element);
            if(focus_element !== object) {
                /* Find common object between previous and new focus */
                var common = me.common(focus_element, object);
                /* Deactivate previous object */
                me.deactivate(focus_element, common);
                /* Activate new object */
                var objects = me.ui.element.to_objects(object);
                me.activate(objects, common, object);
                me.focus_element = me.ui.element.to_path(object);
            }
        }
    };
    me.focus = {
        set: function(object, value) {
            object.focus_class = value;
        }
    };
    me.blur = {
        set : function(object, value) {
            object.blur_class = value;
        }
    };
};
