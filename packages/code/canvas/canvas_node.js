/*
    @author Zakai Hamilton
    @component CanvasNode
*/

package.canvas.node = function CanvasNode(me) {
    me.attach = function(object) {
        object.parentNode = null;
        object._childNodes = [];
        object.appendChild = function(child) {
            return me.appendChild(this, child);
        };
        object.removeChild = function(child) {
            return me.removeChild(this, child);
        };
        object.insertBefore = function(child, sibling) {
            return me.insertBefore(this, child, sibling);
        };
        Object.defineProperty(object, "offsetParent", {
            get: function () {
                return object.parentNode;
            }
        });
        Object.defineProperty(object, "childNodes", {
            get: function () {
                return object._childNodes;
            }
        });
        Object.defineProperty(object, "firstChild", {
            get: function () {
                return me.firstChild(object);
            }
        });
        Object.defineProperty(object, "lastChild", {
            get: function () {
                return me.lastChild(object);
            }
        });
        Object.defineProperty(object, "previousSibling", {
            get: function () {
                return me.previousSibling(object);
            }
        });
        Object.defineProperty(object, "nextSibling", {
            get: function () {
                return me.nextSibling(object);
            }
        });
    };
    me.appendChild = function(object, child) {
        var length = object._childNodes.length;
        if(length && object._childNodes[length-1] === child) {
            return child;
        }
        var parent = child.parentNode;
        if(parent) {
            me.removeChild(parent, child);
        }
        object._childNodes.push(child);
        child.parentNode = object;
        object.setDirty();
        return child;
    };
    me.removeChild = function(object, child) {
        var index = object._childNodes.indexOf(child);
        if(index !== -1) {
            object._childNodes.splice(index, 1);
            child.parentNode = null;
            object.setDirty();
        }
        return child;
    };
    me.insertBefore = function(object, child, sibling) {
        var length = object._childNodes.length;
        if(length && object._childNodes[length-1] === child) {
            return child;
        }
        var parent = child.parentNode;
        if(parent) {
            me.removeChild(parent, child);
        }
        if(sibling) {
            var index = object._childNodes.indexOf(sibling);
            object._childNodes.splice(index, 0, child);
        }
        else {
            object._childNodes.push(child);
        }
        child.parentNode = object;
        object.setDirty();
        return child;
    };
    me.previousSibling = function(object) {
        var sibling = null;
        if(object.parentNode) {
            var index = object.parentNode._childNodes.indexOf(object);
            if(index > 1) {
                sibling = object.parentNode._childNodes[index-1];
            }
        }
        return sibling;
    };
    me.nextSibling = function(object) {
        var sibling = null;
        if(object.parentNode) {
            var index = object.parentNode._childNodes.indexOf(object);
            if(index > 1) {
                sibling = object.parentNode._childNodes[index+1];
            }
        }
        return sibling;
    };
    me.firstChild = function(object) {
        var child = null;
        if(object._childNodes.length) {
            child = object._childNodes[0];
        }
        return child;
    };
    me.lastChild = function(object) {
        var child = null;
        if(object._childNodes.length) {
            child = object._childNodes[object._childNodes.length-1];
        }
        return child;
    };
};
