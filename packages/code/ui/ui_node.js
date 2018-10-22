/*
 @author Zakai Hamilton
 @component UINode
 */

screens.ui.node = function UINode(me) {
    me.childList = function (object) {
        var childNodes = me.childNodes(object);
        if (!childNodes) {
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
            for (; childList[order] && order < childNodes.length; order++);
            childList[order] = child;
        }
        childList = childList.filter(Boolean);
        return childList;
    };
    me.findByName = function(object, name) {
        var element = object.firstChild;
        while (element) {
            if (element.getAttribute && element.getAttribute("name") === name) {
                break;
            }
            var child = me.findByName(element, name);
            if(child) {
                element = child;
                break;
            }
            element = element.nextSibling;
        }
        return element;
    };
    me.findById = function (object, id) {
        var element = object.firstChild;
        while (element) {
            if (element.id === id) {
                break;
            }
            element = element.nextSibling;
        }
        return element;
    };
    me.findByText = function (object, text) {
        var element = object.firstChild;
        while (element) {
            var elementText = me.core.property.get(element, "ui.basic.text");
            if (text === elementText) {
                break;
            }
            element = element.nextSibling;
        }
        return element;
    };
    me.class = function (object, class_name) {
        var class_names = [];
        if(Array.isArray(class_name)) {
            class_names = class_name;
        }
        else {
            class_names = [class_name];
        }
        while (object) {
            if (object === me.ui.element.workspace()) {
                return null;
            }
            for(var class_name of class_names) {
                if(object.classList.contains(class_name)) {
                    return object;
                }
            }
            object = object.parentNode;
        }
        return null;
    };
    me.container = function (object, component_name) {
        var component_names = [];
        if(Array.isArray(component_name)) {
            component_names = component_name;
        }
        else {
            component_names = [component_name];
        }
        while (object) {
            if (object === me.ui.element.workspace()) {
                return null;
            }
            if(component_names.includes(object.component)) {
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
        if (!parent) {
            return null;
        }
        if ("_appendChild" in parent) {
            return parent._appendChild(child);
        } else {
            return parent.appendChild(child);
        }
    };
    me.insertBefore = function (parent, child, sibling) {
        if (!parent) {
            return null;
        }
        if ("_insertBefore" in parent) {
            return parent._insertBefore(child, sibling);
        } else {
            return parent.insertBefore(child, sibling);
        }
    };
    me.removeChildren = function (parent) {
        if (parent) {
            while (parent.lastChild) {
                me.removeChild(parent, parent.lastChild);
            }
        }
    };
    me.removeChild = function (parent, child) {
        if (!parent) {
            return null;
        }
        if ("_removeChild" in parent) {
            return parent._removeChild(child);
        } else {
            return parent.removeChild(child);
        }
    };
    me.firstChild = function (parent) {
        if (!parent) {
            return null;
        }
        if ("_firstChild" in parent) {
            return parent._firstChild;
        } else {
            return parent.firstChild;
        }
    };
    me.lastChild = function (parent) {
        if (!parent) {
            return null;
        }
        if ("_lastChild" in parent) {
            return parent._lastChild;
        } else {
            return parent.lastChild;
        }
    };
    me.childNodes = function (parent) {
        if (!parent) {
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
            if (value && value !== "none") {
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
        if (object) {
            while (object.firstChild) {
                object.removeChild(object.firstChild);
            }
        }
    };
    me.iterate = function(object, callback, recursive=true) {
        var elements = me.childList(object);
        for(var element of elements) {
            callback(element);
            if(recursive) {
                me.iterate(element, callback);
            }
        }
    };
    me.bubble = function(object, callback) {
        var parent = object.parentNode;
        while(parent) {
            callback(parent);
            parent = parent.parentNode;
        }
    };
    me.bind = function (object, data, bindings, baseDefault) {
        var widgets = [];
        for (var binding in bindings) {
            var widget = widgets[binding] = me.ui.node.findByName(object, binding);
            if(!widget) {
                continue;
            }
            var values = bindings[binding].split("|");
            if(baseDefault) {
                values.push(baseDefault);
            }
            for(var value of values) {
                if(value.startsWith(".")) {
                    path = value.substring(1);
                    var info = me.core.json.traverse(data, path);
                    var value = info.value;
                    if(!info.found || typeof value !== "string") {
                        continue;
                    }
                }
                if(widget.value) {
                    widget.value = value;
                }
                else {
                    me.core.property.set(widget, "ui.basic.text", value);
                }
                break;
            }
        }
        return widgets;
    };
};
