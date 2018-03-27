/*
 @author Zakai Hamilton
 @component UINode
 */

screens.ui.node = function UINode(me) {
    me.childList = function (object) {
        var childNodes = me.childNodes(object);
        if(!childNodes) {
            return [];
        }
        var childList = Array(childNodes.length).fill(null);
        for (var childIndex = 0; childIndex < childNodes.length; childIndex++) {
            var child = childNodes[childIndex];
            var order = "auto";
            if (child.component && child.style) {
                order = child.style.zIndex;
            }
            if (!order || order === "auto" || order < 0 || order >= childNodes.length) {
                order = 0;
            }
            for (; childList[order] && order < childNodes.length; order++)
                ;
            childList[order] = child;
        }
        childList = childList.filter(Boolean);
        return childList;
    };
    me.findById = function(object, id) {
        var element = object.firstChild;
        while(element) {
            if(element.id === id) {
                break;
            }
            element = element.nextSibling;
        }
        return element;
    };
    me.container = function (object, component_name) {
        while (object) {
            if (object === me.ui.element.workspace()) {
                return null;
            }
            if (object.component === component_name) {
                return object;
            }
            object = object.parentNode;
        }
        return null;
    };
    me.members = function (object, component_name) {
        var members = [];
        var childList = me.childList(object);
        for (var childIndex = 0; childIndex < childList.length; childIndex++) {
            var child = childList[childIndex];
            if (component_name && child.component !== component_name) {
                continue;
            }
            members.push(child);
        }
        return members;
    };
    me.previous = function (object, component_name) {
        var childList = me.childList(object.parentNode);
        var last = null;
        var found = null;
        for (var childIndex = childList.length - 1; childIndex >= 0; childIndex--) {
            var child = childList[childIndex];
            if (!component_name || child.component !== component_name) {
                continue;
            }
            if (!last) {
                last = child;
            }
            if (child === object) {
                found = true;
            } else if (found) {
                return child;
            }
        }
        if (last && found) {
            return last;
        }
        return null;
    };
    me.next = function (object, component_name) {
        var childList = me.childList(object.parentNode);
        var first = null;
        var found = null;
        for (var childIndex = 0; childIndex < childList.length; childIndex++) {
            var child = childList[childIndex];
            if (!component_name || child.component !== component_name) {
                continue;
            }
            if (!first) {
                first = child;
            }
            if (child === object) {
                found = true;
            } else if (found) {
                return child;
            }
        }
        if (first && found) {
            return first;
        }
        return null;
    };
    me.path = function (object) {
        var array = [];
        if (object) {
            while (object) {
                array.push(object);
                if (object === me.ui.element.workspace()) {
                    break;
                }
                object = object.parentNode;
            }
        }
        return array;
    };
    me.appendChild = function (parent, child) {
        if(!parent) {
            return null;
        }
        if ("_appendChild" in parent) {
            return parent._appendChild(child);
        } else {
            return parent.appendChild(child);
        }
    };
    me.insertBefore = function (parent, child, sibling) {
        if(!parent) {
            return null;
        }
        if ("_insertBefore" in parent) {
            return parent._insertBefore(child, sibling);
        } else {
            return parent.insertBefore(child, sibling);
        }
    };
    me.removeChildren = function (parent) {
        if(parent) {
            while (parent.lastChild) {
                me.removeChild(parent, parent.lastChild);
            }
        }
    };
    me.removeChild = function (parent, child) {
        if(!parent) {
            return null;
        }
        if ("_removeChild" in parent) {
            return parent._removeChild(child);
        } else {
            return parent.removeChild(child);
        }
    };
    me.firstChild = function (parent) {
        if(!parent) {
            return null;
        }
        if ("_firstChild" in parent) {
            return parent._firstChild;
        } else {
            parent.firstChild;
        }
    };
    me.lastChild = function (parent) {
        if(!parent) {
            return null;
        }
        if ("_lastChild" in parent) {
            return parent._lastChild;
        } else {
            parent.firstChild;
        }
    };
    me.childNodes = function (parent) {
        if(!parent) {
            return null;
        }
        if ("_childNodes" in parent) {
            return parent._childNodes;
        } else {
            return parent.childNodes;
        }
    };
    me.parent = {
        get: function (object) {
            return object.parentNode;
        },
        set: function (object, value) {
            if (object.parentNode) {
                me.removeChild(object.parentNode, object);
            }
            if (value) {
                me.appendChild(value, object);
            }
        }
    };
    me.moveToFirst = {
        set: function (object, value) {
            if (object.parentNode && value) {
                me.insertBefore(object.parentNode, object, object.parentNode.firstChild);
            }
        }
    };
    me.unshift = {
        set: function (object, value) {
            if (object.parentNode) {
                me.removeChild(object.parentNode, object);
            }
            if (value) {
                me.insertBefore(value, object, me.firstChild(value));
            }
        }
    };
    me.index = function (object) {
        for (var index = 0; (object = object.previousSibling); index++)
            ;
        return index;
    };
    me.shift = function (object, target) {
        if (object && target && object !== target && object.parentNode && object.parentNode === target.parentNode) {
            var object_index = me.index(object);
            var target_index = me.index(target);
            if (!target.nextSibling) {
                me.appendChild(object.parentNode, object);
            } else if (!target.previousSibling) {
                me.insertBefore(object.parentNode, object, target);
            } else if (object_index > target_index) {
                me.insertBefore(object.parentNode, object, target);
            } else {
                me.insertBefore(object.parentNode, object, target.nextSibling);
            }
        }
    };
    me.empty = function (object) {
        if(object) {
            while (object.firstChild) {
                object.removeChild(object.firstChild);
            }
        }
    };
};
