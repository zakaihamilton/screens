/*
 @author Zakai Hamilton
 @component UINode
 */

package.ui.node = function UINode(me) {
    me.childList = function(object) {
        var childList = Array(object.childNodes.length).fill(null);
        for(var childIndex = 0; childIndex < object.childNodes.length; childIndex++) {
            var child = object.childNodes[childIndex];
            var order = "auto";
            if(child.component) {
                order = getComputedStyle(child).zIndex;
            }
            if(!order || order === "auto" || order < 0 || order >= object.childNodes.length) {
                order = 0;
            }
            for(;childList[order] && order < object.childNodes.length; order++);
            childList[order] = child;
        }
        childList = childList.filter(Boolean);
        return childList;
    };
    me.container = function (object, component_name) {
        while (object) {
            if (object === document.body) {
                return null;
            }
            if (object.component === component_name) {
                return object;
            }
            object = object.parentNode;
        }
        return null;
    };
    me.members = function(object, component_name) {
        var members = [];
        var childList = me.childList(object);
        for(var childIndex = 0; childIndex < childList.length; childIndex++) {
            var child = childList[childIndex];
            if (component_name && child.component !== component_name) {
                continue;
            }
            members.push(child);
        }
        return members;
    };
    me.first = function(object, component_name) {
        var childList = me.childList(object);
        for(var childIndex = 0; childIndex < childList.length; childIndex++) {
            var child = childList[childIndex];
            if (component_name && child.component === component_name) {
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
        var childList = me.childList(object);
        for(var childIndex = childList.length - 1; childIndex >= 0; childIndex--) {
            var child = childList[childIndex];
            if (component_name && child.component === component_name) {
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