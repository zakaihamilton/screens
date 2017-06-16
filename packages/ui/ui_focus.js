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
            me.ui.element.set(object, "ui.focus.active", true);
        });
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
        for(; index < list.length; index++) {
            if(list[index] === from) {
                break;
            }
        }
        for(;index < list.length;index++) {
            var object = list[index];
            object.is_active = true;
            if(from.focus_class) {
                me.ui.element.set(object, "ui.style.class", from.focus_class);
            }
            if(object === to) {
                break;
            }
        }
    };
    me.common = function(source, target) {
        if(!source || !target) {
            return me.ui.element.root;
        }
        var common = null;
        var sources = me.ui.element.to_objects(source);
        var targets = me.ui.element.to_objects(target);
        var length = sources.length > targets.length ? targets.length : sources.length;
        for(var index = 0; index < length; index++) {
            if(sources[index] === targets[index]) {
                common = sources[index];
            }
            else {
                break;
            }
        }
        return common;
    };
    me.apply_focus = function(object, state) {
        for(var index = 0; index < object.childNodes.length; index++) {
            var child = object.childNodes[index];
            if(child.focusable) {
                continue;
            }
            if(state) {
                if(child.focus_class) {
                    me.ui.element.set(child, "ui.style.class", child.focus_class);
                }
            }
            else {
                if(child.blur_class) {
                    me.ui.element.set(child, "ui.style.class", child.blur_class);
                }
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
                /* Apply focus to children */
                me.apply_focus(object, true);
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
