/*
 @author Zakai Hamilton
 @component UINode
 */

package.ui.node = function UINode(me) {
    me.first = function(object, component_name) {
        for(var childIndex = 0; childIndex < object.childNodes.length; childIndex++) {
            var child = object.childNodes[childIndex];
            if (child.component === component_name) {
                return child;
            }
            var result = me.first(child, component_name);
            if(result) {
                return result;
            }
        }
        return null;
    };
    me.last = function(object, component_name) {
        for(var childIndex = object.childNodes.length - 1; childIndex >= 0; childIndex--) {
            var child = object.childNodes[childIndex];
            if (child.component === component_name) {
                return child;
            }
            var result = me.last(child, component_name);
            if(result) {
                return result;
            }
        }
        return null;
    };
    me.path = function(object) {
        var array = [];
        if(object) {
            while(object) {
                array.push(object);
                if(object === document.body) {
                    break;
                }
                object = object.parentNode;
            }
        }
        return array;
    };
    me.parent = {
        get : function(object) {
            return object.parentNode;
        },
        set : function(object, value) {
            if(object.parentNode) {
                object.parentNode.removeChild(object);
            }
            if(value) {
                value.appendChild(object);
            }
        }
    };
    me.unshift = {
        set: function(object, value) {
            if(object.parentNode) {
                object.parentNode.removeChild(object);
            }
            if(value) {
                value.insertBefore(object, value.firstChild);
            }
        }
    };
    me.index = function(object) {
        for (var index = 0; (object = object.previousElementSibling); index++);
        return index;
    };
    me.shift = function(object, target) {
        if(object && target && object !== target && object.parentNode && object.parentNode === target.parentNode) {
            var object_index = me.index(object);
            var target_index = me.index(target);
            if(!target.nextSibling) {
                object.parentNode.appendChild(object);
            }
            else if(!target.previousSibling) {
                object.parentNode.insertBefore(object, target);
            }
            else if(object_index > target_index) {
                object.parentNode.insertBefore(object, target);
            }
            else {
                object.parentNode.insertBefore(object, target.nextSibling);
            }
        }
    };
};